import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { PAYMENT_LABELS, STATUS_LABELS, formatDate, orderNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { setOrderStatus } from "../../actions";
import styles from "../../admin.module.css";

const ACTIONS = {
  placed: [
    { to: "shipped", label: "Mark as shipped" },
    { to: "cancelled", label: "Cancel order (puts stock back, refunds a paid order)", danger: true },
  ],
  shipped: [
    { to: "delivered", label: "Mark as delivered" },
    { to: "cancelled", label: "Cancel order (puts stock back, refunds a paid order)", danger: true },
  ],
};

export default async function AdminOrder({ params, searchParams }) {
  await requireAdmin();
  const { id: rawId } = await params;
  const { updated, error } = await searchParams;
  if (!/^\d{1,9}$/.test(rawId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: Number(rawId) },
    include: { items: { orderBy: { id: "asc" } }, user: { select: { email: true } } },
  });
  if (!order) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <h1>Order {orderNumber(order.id)}</h1>
        <div className={styles.barRight}>
          <Link href="/admin/orders" className={styles.ghost}>All orders</Link>
        </div>
      </div>

      {updated && <p className={styles.ok} role="status">Order updated.</p>}
      {error === "refund" && (
        <p className={styles.error} role="alert">
          The refund did not go through, so the order was NOT cancelled. Please try again, or refund it in the Razorpay dashboard.
        </p>
      )}

      <div className={styles.detail}>
        <p>Placed {formatDate(order.createdAt)}</p>
        <p><span className={styles.statusPill}>{STATUS_LABELS[order.status] ?? order.status}</span></p>

        <h2>Ship to</h2>
        <address style={{ fontStyle: "normal", lineHeight: 1.6 }}>
          {order.shipName}<br />
          {order.shipLine1}<br />
          {order.shipLine2 && <>{order.shipLine2}<br /></>}
          {order.shipCity}, {order.shipState} {order.shipPincode}<br />
          Mobile: {order.shipPhone}<br />
          Account email: {order.user.email}
        </address>

        <h2>Items</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Item</th><th>Size</th><th>Price</th><th>Qty</th><th>Total</th></tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.size}</td>
                  <td>{formatPrice(i.price)}</td>
                  <td>{i.qty}</td>
                  <td>{formatPrice(i.price * i.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Subtotal: {formatPrice(order.subtotal)}</p>
        <p>Shipping: {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</p>
        {order.paymentMethod === "cod" ? (
          <p><strong>Total to collect: {formatPrice(order.total)}</strong> (pay on delivery)</p>
        ) : order.paidAt ? (
          <p>
            <strong>Total: {formatPrice(order.total)}, paid online</strong> on {formatDate(order.paidAt)}
            <br />
            <small>Razorpay payment {order.razorpayPaymentId}{order.refundId ? ` · refunded (${order.refundId})` : ""}</small>
          </p>
        ) : (
          <p><strong>Total: {formatPrice(order.total)}</strong> (not paid)</p>
        )}

        {ACTIONS[order.status] && (
          <>
            <h2>Update status</h2>
            <div className={styles.statusForm}>
              {ACTIONS[order.status].map((a) => (
                <form key={a.to} action={setOrderStatus}>
                  <input type="hidden" name="id" value={order.id} />
                  <input type="hidden" name="status" value={a.to} />
                  <button type="submit" className={a.danger ? styles.danger : styles.primary}>{a.label}</button>
                </form>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
