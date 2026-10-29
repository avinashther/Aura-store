// Razorpay calls this address by itself when a payment succeeds. It is the safety net
// for a customer who paid and then closed the tab before our site could confirm it.
// Anyone on the internet can POST here, so the signature is checked FIRST.

import { prisma } from "@/lib/prisma";
import { markPaid } from "@/lib/payments";
import { webhookSignatureIsValid } from "@/lib/razorpay";

export async function POST(request) {
  const raw = await request.text(); // the signature covers the exact raw text

  let valid = false;
  try {
    valid = webhookSignatureIsValid(raw, request.headers.get("x-razorpay-signature"));
  } catch (e) {
    console.error("Razorpay webhook:", e.message);
    return new Response("Webhook is not set up", { status: 503 });
  }
  if (!valid) return new Response("Bad signature", { status: 400 });

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // We only care about "the money arrived". Other events are acknowledged and ignored.
  if (event?.event !== "payment.captured" && event?.event !== "order.paid") {
    return new Response("ignored", { status: 200 });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment?.order_id) return new Response("ignored", { status: 200 });

  const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id } });
  if (!order) return new Response("unknown order", { status: 200 });

  // The amount must match what we asked for.
  if (payment.amount !== order.total * 100) {
    console.error(`Razorpay webhook: amount mismatch for order ${order.id}`);
    return new Response("amount mismatch", { status: 200 });
  }

  try {
    await markPaid(order.id, payment.id);
  } catch (e) {
    console.error("Razorpay webhook: markPaid failed", e);
    return new Response("try again", { status: 500 }); // Razorpay will retry later
  }
  return new Response("ok", { status: 200 });
}
