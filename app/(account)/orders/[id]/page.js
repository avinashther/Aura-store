import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { releaseExpiredOrders } from "@/lib/payments";
import OrderPayActions from "@/components/OrderPayActions";
import { PAYMENT_LABELS, STATUS_LABELS, formatDate, orderNumber } from "@/lib/orders";
import { cloudinaryUrl, formatPrice } from "@/lib/products";
import styles from "../orders.module.css";

export const metadata = { title: "Your order – AURA" };

export default async function OrderPage({ params, searchParams }) {
  const user = await requireUser();
  const { id: rawId } = await params;
  const { placed, verify } = await searchParams;

  await releaseExpiredOrders(); // anything unpaid for too long goes back on the shelf

  const id = /^\d{1,9}$/.test(rawId) ? Number(rawId) : null;
  if (id === null) notFound();

  // "userId: user.id" is the important part: you can only open YOUR OWN orders.
  // Someone else's order number gives the same "not found" as one that doesn't exist.
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!order) notFound();

  return (
    <div className={styles.page}>
      <h1>Order {orderNumber(order.id)}</h1>
      <p className={styles.muted}>Placed {formatDate(order.createdAt)}</p>
      {order.status === "placed" && placed && (
        <p className={styles.thanks} role="status">
          Thank you! Your payment is received and your order is placed. We will get it ready for delivery.
        </p>
      )}
      {order.status === "awaiting_payment" && (
        <>
          <p className={styles.waiting} role="status">
            {verify
              ? "We are still confirming your payment. If money was taken, this page will update shortly and you will not be charged twice."
              : "Your payment is not complete yet."}{" "}
            We are holding your items until {formatDate(order.expiresAt)}.
          </p>
          <OrderPayActions orderId={order.id} />
        </>
      )}
      {order.status === "expired" && (
        <p className={styles.waiting} role="status">
          This order was not paid in time, so the items went back on the shelf. If money was taken, it is refunded
          automatically. <Link href="/shop"><u>Back to the shop</u></Link>
        </p>
      )}
      <p>
        <span className={styles.status}>{STATUS_LABELS[order.status] ?? order.status}</span>
      </p>

      <h2>Items</h2>
      <ul className={styles.items}>
        {order.items.map((i) => (
          <li key={i.id}>
            <div className={styles.thumb}>
              {i.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cloudinaryUrl(i.image, 160)} alt="" />
              )}
            </div>
            <div>
              {i.name}
              <small>Size {i.size} · {formatPrice(i.price)} × {i.qty}</small>
            </div>
            <div>{formatPrice(i.price * i.qty)}</div>
          </li>
        ))}
      </ul>

      <div className={styles.sums}>
        <p><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></p>
        <p><span>Shipping</span><span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span></p>
        <p className={styles.grand}><span>Total</span><span>{formatPrice(order.total)}</span></p>
        <p className={styles.muted}>
          <span>Payment</span>
          <span>
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            {order.paidAt && !order.refundId ? ` · paid ${formatDate(order.paidAt)}` : ""}
            {order.refundId ? " · refunded" : ""}
          </span>
        </p>
      </div>

      <h2>Delivering to</h2>
      <address className={styles.address}>
        {order.shipName}<br />
        {order.shipLine1}<br />
        {order.shipLine2 && <>{order.shipLine2}<br /></>}
        {order.shipCity}, {order.shipState} {order.shipPincode}<br />
        Mobile: {order.shipPhone}
      </address>

      <p className={styles.back}>
        <Link href="/account"><u>Back to your account</u></Link> · <Link href="/shop"><u>Keep shopping</u></Link>
      </p>
    </div>
  );
}
