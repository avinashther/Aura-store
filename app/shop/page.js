import { Suspense } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import styles from "./shop.module.css";

export const metadata = { title: "Shop – AURA" };

const SORTS = [
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

// Reading the URL (searchParams) happens at request time, so Next.js wants it
// inside <Suspense>: the page shell shows instantly, the product list streams in.
export default function ShopPage({ searchParams }) {
  return (
    <Suspense fallback={<div className={styles.page}><h1>Shop</h1></div>}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}

// The filters live in the URL:  /shop?category=tops&sort=price-asc
// That means every filter combination has its own shareable link.
async function ShopContent({ searchParams }) {
  const { category, sort = "new" } = await searchParams;

  let items = PRODUCTS.filter((p) => !category || p.category === category);
  if (sort === "price-asc") items = [...items].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") items = [...items].sort((a, b) => b.price - a.price);

  // Builds a link like /shop?category=tops&sort=price-asc
  const href = (cat, s) => {
    const q = new URLSearchParams();
    if (cat) q.set("category", cat);
    if (s && s !== "new") q.set("sort", s);
    const qs = q.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  const heading = CATEGORIES.find((c) => c.slug === category)?.label ?? "All products";

  return (
    <div className={styles.page}>
      <h1>{heading}</h1>

      <div className={styles.controls}>
        <nav aria-label="Categories" className={styles.chips}>
          <Link href={href(null, sort)} aria-current={!category ? "page" : undefined}>
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={href(c.slug, sort)}
              aria-current={category === c.slug ? "page" : undefined}
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Sort" className={styles.sorts}>
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={href(category, s.value)}
              aria-current={sort === s.value ? "true" : undefined}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>

      {items.length ? (
        <ProductGrid products={items} />
      ) : (
        <p>Nothing here yet. <Link href="/shop"><u>See everything</u></Link>.</p>
      )}
    </div>
  );
}
