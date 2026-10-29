import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { STATUS_LABELS, formatDate, orderNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import styles from "../admin.module.css";

export default async function AdminOrders() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { id: "desc" },
    take: 200,
    include: { user: { select: { email: true } }, _count: { select: { items: true } } },
  });

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <h1>Orders</h1>
        <div className={styles.barRight}>
          <Link href="/admin" className={styles.ghost}>Products</Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{orderNumber(o.id)}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{o.shipName}<br /><small>{o.shipCity}</small></td>
                  <td>{o._count.items}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td><span className={styles.statusPill}>{STATUS_LABELS[o.status] ?? o.status}</span></td>
                  <td className={styles.actions}><Link href={`/admin/orders/${o.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
