// Talking to Razorpay (server only: it uses the SECRET key).
//
// How an online payment works:
//  1. Our server tells Razorpay "a customer will pay ₹X" and gets back a Razorpay order id.
//  2. The customer pays inside Razorpay's own window (UPI, card, netbanking).
//     Their card details never touch our website.
//  3. Razorpay gives the browser a "signature": proof of payment, made with our secret key.
//  4. Our server recomputes that signature. If it matches, the payment is real.
//     (The browser could say "I paid" about anything, so we never trust that alone.)
//  5. As a backup, Razorpay also calls our webhook when a payment succeeds, in case the
//     customer closed the tab right after paying.

import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Only changed in our own tests, so they can run against a pretend Razorpay.
const API = process.env.RAZORPAY_API_BASE || "https://api.razorpay.com/v1";

export const razorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

function keys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
  }
  return { keyId, keySecret };
}

export const razorpayKeyId = () => keys().keyId;

async function call(method, path, body) {
  const { keyId, keySecret } = keys();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000), // never hang forever
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.description || `Razorpay error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Razorpay counts money in paise (₹1 = 100 paise).
export async function createRazorpayOrder({ rupees, receipt, notes }) {
  return call("POST", "/orders", {
    amount: rupees * 100,
    currency: "INR",
    receipt,
    notes,
  });
}

// Gives the customer's money back (to the way they paid).
export async function refundPayment(paymentId, rupees, notes) {
  try {
    const refund = await call("POST", `/payments/${encodeURIComponent(paymentId)}/refund`, {
      amount: rupees * 100,
      speed: "normal",
      notes,
    });
    return { id: refund.id };
  } catch (e) {
    // Asking twice must be harmless: "already refunded" counts as done.
    if (/already|fully refunded/i.test(e.message)) return { id: "already-refunded" };
    throw e;
  }
}

const hmac = (text, secret) => createHmac("sha256", secret).update(text).digest("hex");

// Compare without leaking how many letters matched.
function same(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

// Step 4 above. Uses OUR stored razorpay order id, not the one the browser sent.
export function paymentSignatureIsValid(razorpayOrderId, paymentId, signature) {
  const { keySecret } = keys();
  return same(hmac(`${razorpayOrderId}|${paymentId}`, keySecret), signature ?? "");
}

// Webhook calls are signed with a separate secret that you also type into Razorpay's dashboard.
export function webhookSignatureIsValid(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("Add RAZORPAY_WEBHOOK_SECRET to .env");
  return same(hmac(rawBody, secret), signature ?? "");
}
