import Link from "next/link";
import { notFound } from "next/navigation";
import AddToBag from "@/components/AddToBag";
import ProductArt from "@/components/ProductArt";
import { ProductGrid } from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES, formatPrice, getProduct, isSoldOut } from "@/lib/products";
import styles from "./product.module.css";

// [slug] in the folder name = a dynamic route.
// /product/moss-boxy-tee  →  params.slug === "moss-boxy-tee"

// Tell Next.js which product pages exist so it can build them ahead of time.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

// Each product gets its own browser-tab title (good for Google too).
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return { title: `${product.name} – AURA`, description: product.description };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound(); // shows the 404 page

  const category = CATEGORIES.find((c) => c.slug === product.category);
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  ).slice(0, 4);

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/shop">Shop</Link> <span aria-hidden="true">/</span>{" "}
        <Link href={`/shop?category=${category.slug}`}>{category.label}</Link>
      </nav>

      <div className={styles.layout}>
        <div className={styles.art}>
          <ProductArt product={product} />
        </div>

        <div className={styles.info}>
          <h1>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <p className={styles.desc}>{product.description}</p>

          {isSoldOut(product) ? (
            <p className={styles.sold}>Sold out</p>
          ) : (
            <AddToBag product={product} />
          )}

          <ul className={styles.details}>
            {product.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className={styles.related} aria-labelledby="more">
          <h2 id="more">More {category.label.toLowerCase()}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
