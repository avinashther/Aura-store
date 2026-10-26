import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToBag from "@/components/AddToBag";
import Gallery from "@/components/Gallery";
import ProductArt from "@/components/ProductArt";
import { ProductGrid } from "@/components/ProductCard";
import { CATEGORIES, formatPrice, isSoldOut } from "@/lib/products";
import { getProduct, getRelated } from "@/lib/catalog";
import styles from "./product.module.css";

// [slug] in the folder name = a dynamic route.
// /product/moss-boxy-tee  →  params.slug === "moss-boxy-tee"

// We do NOT pre-build every product page. A pre-built page can show the old version
// for a moment after the admin saves a change. Instead, each page is put together
// when someone visits it, using product data that the admin panel refreshes instantly.

// Each product gets its own browser-tab title (good for Google too).
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: `${product.name} – AURA`, description: product.description };
}

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound(); // shows the 404 page

  const category = CATEGORIES.find((c) => c.slug === product.category);
  const related = await getRelated(product.category, product.slug);

  return (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/shop">Shop</Link> <span aria-hidden="true">/</span>{" "}
        <Link href={`/shop?category=${category.slug}`}>{category.label}</Link>
      </nav>

      <div className={styles.layout}>
        {product.images.length > 0 ? (
          <Gallery images={product.images} name={product.name} />
        ) : (
          <div className={styles.art}>
            <ProductArt product={product} />
          </div>
        )}

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
