"use server";

// What a customer can do with an order they already started: confirm a payment,
// pay again, or cancel before paying. Each action checks the order is THEIRS.

import { updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/session";
import { markPaid, releaseOrder } from "@/lib/payments";
import { paymentSignatureIsValid, razorpayKeyId } from "@/lib/razorpay";

const validId = (id) => Number.isInteger(id) && id > 0 && id < 2_000_000_000;
const text = (v) => (typeof v === "string" && v.length > 0 && v.length <= 100 ? v : null);

// The browser says "paid!" and sends proof. We check the proof ourselves.
export async function verifyPayment(orderId, response) {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: "Please log in again." };
    if (!validId(orderId)) return { ok: false, error: "Order not found." };

    const razorpayOrderId = text(response?.razorpay_order_id);
    const paymentId = text(response?.razorpay_payment_id);
    const signature = text(response?.razorpay_signature);
    if (!razorpayOrderId || !paymentId || !signature) return { ok: false, error: "Payment details were incomplete." };

    const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id } });
    // The payment must be for THIS order's Razorpay request.
    if (!order || order.razorpayOrderId !== razorpayOrderId) return { ok: false, error: "Order not found." };

    if (!paymentSignatureIsValid(order.razorpayOrderId, paymentId, signature)) {
      console.warn(`Order ${order.id}: payment signature did not match`);
      return { ok: false, error: "We could not verify this payment. If money was taken, it will be refunded." };
    }

    const result = await markPaid(order.id, paymentId);
    if (result.refunded) {
      return {
        ok: false,
        refunded: true,
        error: "Your payment arrived after the order expired and the item sold out. You have been refunded.",
      };
    }
    return { ok: result.ok };
  } catch (e) {
    console.error("verifyPayment failed:", e);
    return { ok: false, error: "We could not confirm the payment yet. If money was taken, your order will update shortly." };
  }
}

// "Pay now" on an unpaid order: same Razorpay request, a fresh window.
export async function retryPayment(orderId) {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: "Please log in again." };
    if (!validId(orderId)) return { ok: false, error: "Order not found." };

    const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id } });
    if (!order || order.status !== "awaiting_payment" || !order.razorpayOrderId) {
      return { ok: false, error: "This order can no longer be paid." };
    }
    if (order.expiresAt && order.expiresAt < new Date()) {
      return { ok: false, error: "This order expired. Please place it again from your bag." };
    }
    return {
      ok: true,
      pay: {
        keyId: razorpayKeyId(),
        razorpayOrderId: order.razorpayOrderId,
        amount: order.total * 100,
        name: order.shipName,
        email: user.email,
        phone: order.shipPhone,
      },
    };
  } catch (e) {
    console.error("retryPayment failed:", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

// Changed your mind before paying? The pieces go back on the shelf.
export async function cancelUnpaidOrder(orderId) {
  const user = await getUser();
  if (!user || !validId(orderId)) return { ok: false };
  const done = await releaseOrder(orderId, "cancelled", { userId: user.id });
  if (done) updateTag("products");
  return { ok: done };
}
