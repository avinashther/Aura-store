import CardLink from "./CardLink";
import ProductArt from "./ProductArt";
import { formatPrice, isSoldOut } from "@/lib/products";
import styles from "./ProductCard.module.css";

// One product card. The whole card is a link to the product page (see CardLink).
export default function ProductCard({ product }) {
  const soldOut = isSoldOut(product);
  return (
    <CardLink href={`/product/${product.slug}`}>
      <div className={styles.art}>
        <ProductArt product={product} />
        {soldOut ? (
          <span className={styles.badge}>Sold out</span>
        ) : (
          product.isNew && <span className={styles.badge}>New</span>
        )}
      </div>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.price}>{formatPrice(product.price)}</p>
    </CardLink>
  );
}

// A responsive grid of cards: 2 columns on phones, 4 on desktop.
export function ProductGrid({ products }) {
  return (
    <ul className={styles.grid}>
      {products.map((p) => (
        <li key={p.slug}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
