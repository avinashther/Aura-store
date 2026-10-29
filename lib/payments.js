// What happens to an order's STOCK and STATUS around a payment. Server only.
//
//  awaiting_payment  → the customer is paying. The pieces are set aside for HOLD_MINUTES.
//  placed            → paid. This is the one your friend packs and ships.
//  expired           → nobody paid in time; the pieces went back on the shelf.
//  cancelled         → cancelled by the customer (before paying) or by the admin (with a refund).

import "server-only";
import { connection } from "next/server";
import { updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { refundPayment } from "@/lib/razorpay";

export const HOLD_MINUTES = 30;
export const MAX_UNPAID_ORDERS = 3; // stops one person from holding all your stock

// Put the pieces of an order back on the shelf. Call inside a transaction.
export async function restock(tx, items) {
  for (const item of items) {
    if (item.productId === null) continue;
    await tx.variant.updateMany({
      where: { productId: item.productId, size: item.size },
      data: { stock: { increment: item.qty } },
    });
  }
}

// Close an UNPAID order and give its pieces back. It only acts if the order is still
// awaiting payment, so running it twice (or at the same time as a payment) is safe.
// `extraWhere` adds more conditions (the customer's id, or "has expired").
export async function releaseOrder(orderId, status, extraWhere = {}, { invalidate = false } = {}) {
  const released = await prisma.$transaction(async (tx) => {
    const changed = await tx.order.updateMany({
      where: { id: orderId, status: "awaiting_payment", ...extraWhere },
      data: { status },
    });
    if (changed.count === 0) return false;
    await restock(tx, await tx.orderItem.findMany({ where: { orderId } }));
    return true;
  });
  // updateTag (refresh the shop's remembered stock now) only works inside server actions.
  if (released && invalidate) updateTag("products");
  return released;
}

// Orders nobody paid for in time go back on the shelf. There is no timer running on the
// server, so this "housekeeping" is done whenever someone visits a page that cares.
export async function releaseExpiredOrders({ invalidate = false } = {}) {
  await connection();
  const now = new Date();
  const due = await prisma.order.findMany({
    where: { status: "awaiting_payment", expiresAt: { lt: now } },
    select: { id: true },
    take: 50,
  });
  for (const { id } of due) {
    await releaseOrder(id, "expired", { expiresAt: { lt: now } }, { invalidate });
  }
}

class OutOfStock extends Error {}

// The money is paid back and the order is closed.
async function refundAndClose(order, paymentId) {
  const refund = await refundPayment(paymentId, order.total, { order: String(order.id) });
  await prisma.order.updateMany({
    where: { id: order.id, status: { in: ["expired", "cancelled"] } },
    data: { status: "cancelled", razorpayPaymentId: paymentId, paidAt: new Date(), refundId: refund.id },
  });
}

// A payment for this order has been confirmed (by the browser check OR the webhook).
// Safe to call many times, and from both at once.
// Returns { ok: true } when the order is paid, or { ok: false, refunded: true } when we
// had to give the money back.
export async function markPaid(orderId, paymentId, depth = 0) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { ok: false };

  // Already paid.
  if (order.paidAt && order.status !== "cancelled") {
    if (order.razorpayPaymentId === paymentId) return { ok: true };
    // The customer paid TWICE for one order. Give the second payment back.
    const refund = await refundPayment(paymentId, order.total, { order: String(order.id), why: "duplicate payment" });
    console.warn(`Order ${order.id}: duplicate payment ${paymentId} refunded (${refund.id})`);
    return { ok: true };
  }

  if (order.status === "awaiting_payment") {
    const paid = await prisma.order.updateMany({
      where: { id: orderId, status: "awaiting_payment" },
      data: { status: "placed", razorpayPaymentId: paymentId, paidAt: new Date(), expiresAt: null },
    });
    if (paid.count === 1) return { ok: true };
    // Something else changed it a split second ago. Look again (but only once or twice).
    return depth < 2 ? markPaid(orderId, paymentId, depth + 1) : { ok: false };
  }

  if (order.status === "expired") {
    // The payment came in after the 30 minutes. If the pieces are still there, take them
    // again and accept the order; if not, give the money back.
    try {
      const reserved = await prisma.$transaction(async (tx) => {
        const flipped = await tx.order.updateMany({
          where: { id: orderId, status: "expired" },
          data: { status: "placed", razorpayPaymentId: paymentId, paidAt: new Date(), expiresAt: null },
        });
        if (flipped.count === 0) return false;
        for (const item of order.items) {
          if (item.productId === null) throw new OutOfStock();
          const taken = await tx.variant.updateMany({
            where: { productId: item.productId, size: item.size, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (taken.count === 0) throw new OutOfStock();
        }
        return true;
      });
      return reserved ? { ok: true } : markPaid(orderId, paymentId, depth + 1);
    } catch (e) {
      if (!(e instanceof OutOfStock)) throw e;
      await refundAndClose(order, paymentId);
      return { ok: false, refunded: true };
    }
  }

  // Cancelled (or any other closed state): the customer paid for something we no longer
  // hold, so the money goes straight back.
  if (order.refundId) return { ok: false, refunded: true };
  await refundAndClose(order, paymentId);
  return { ok: false, refunded: true };
}
