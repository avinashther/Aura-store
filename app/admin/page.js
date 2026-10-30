import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { formatPrice } from "@/lib/products";
import { logout } from "./actions";
import DeleteProductButton from "./DeleteProductButton";
import styles from "./admin.module.css";

export default async function AdminHome({ searchParams }) {
  await requireAdmin();
  const { saved, deleted } = await searchParams;

  // The admin always asks the database directly (never the remembered copy),
  // so it always shows the truth.
  const products = await prisma.product.findMany({
    orderBy: { id: "desc" },
    include: { variants: true },
  });

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <h1>Products</h1>
        <div className={styles.barRight}>
          <Link href="/admin/products/new" className={styles.primary}>Add product</Link>
          <form action={logout}>
            <button type="submit" className={styles.ghost}>Log out</button>
          </form>
        </div>
      </div>

      {saved && <p className={styles.ok} role="status">Saved. The shop is updated.</p>}
      {deleted && <p className={styles.ok} role="status">Deleted. The product is gone from the shop.</p>}

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>In stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td>{stock === 0 ? "Sold out" : `${stock} pcs`}</td>
                    <td>{p.isActive ? "Visible" : "Hidden"}</td>
                    <td>
                      <div className={styles.actions}>
                      <Link href={`/admin/products/${p.id}`}>Edit</Link>
                      {p.isActive && <Link href={`/product/${p.slug}`}>View</Link>}
                      <DeleteProductButton id={p.id} name={p.name} className={styles.linkDanger} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
