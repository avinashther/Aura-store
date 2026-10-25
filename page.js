import Link from "next/link";
import Hero from "@/components/Hero";
import { ProductGrid } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import styles from "./page.module.css";

export default function Home() {
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);

  return (
    <>
      <Hero />

      <section id="new-arrivals" className={styles.section}>
        <div className={styles.head}>
          <h2>New arrivals</h2>
          <Link href="/shop" className={styles.more}>View all</Link>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      <section className={styles.section} aria-labelledby="cat-title">
        <div className={styles.head}>
          <h2 id="cat-title">Shop by category</h2>
        </div>
        <ul className={styles.cats}>
          {CATEGORIES.map((c) => {
            const count = PRODUCTS.filter((p) => p.category === c.slug).length;
            return (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className={styles.cat}>
                  <span className={styles.catName}>{c.label}</span>
                  <span className={styles.catCount}>{count} pieces</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Placeholder copy: replace with your friend's real story */}
      <section id="story" className={styles.story}>
        <p>
          Everyday clothes with a bit of presence. Picked, priced and sent out
          by people who care how it fits.
        </p>
      </section>
    </>
  );
}
