import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { releaseExpiredOrders } from "@/lib/payments";
import { STATUS_LABELS, formatDate, orderNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { logout } from "../actions";
import styles from "../account.module.css";
import orderStyles from "../orders/orders.module.css";

export const metadata = { title: "Your account – AURA" };

export default async function AccountPage() {
  const user = await requireUser();
  await releaseExpiredOrders();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" },
    take: 20,
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className={styles.page}>
      <h1>Hi, {user.name}</h1>
      <p className={styles.muted}>{user.email}</p>

      <section className={styles.box}>
        <h2>Your orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet. <Link href="/shop"><u>Start shopping</u></Link></p>
        ) : (
          <ul className={orderStyles.list}>
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/orders/${o.id}`}>
                  <strong>{orderNumber(o.id)}</strong>
                  <strong>{formatPrice(o.total)}</strong>
                  <span className={orderStyles.muted}>{formatDate(o.createdAt)} · {o._count.items} item{o._count.items === 1 ? "" : "s"}</span>
                  <span>{STATUS_LABELS[o.status] ?? o.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={logout}>
        <button type="submit" className={styles.ghost}>Log out</button>
      </form>
    </div>
  );
}
