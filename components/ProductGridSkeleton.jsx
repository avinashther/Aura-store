import styles from "./ProductCard.module.css";

// Placeholder cards (soft shimmer) shown while the real product list is loading.
// Same grid and card shape as the real thing, so nothing jumps when products arrive.
export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <ul className={styles.grid} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className={`${styles.card} ${styles.skCard}`}>
            <div className={`${styles.art} ${styles.sk}`} />
            <div className={`${styles.skLine} ${styles.sk}`} style={{ width: "70%" }} />
            <div className={`${styles.skLine} ${styles.sk}`} style={{ width: "35%" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
