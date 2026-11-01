"use client";

import { useSyncExternalStore } from "react";
import ProductArt from "@/components/ProductArt";
import { formatPrice } from "@/lib/products";
import { readPeek, noSubscribe, noPeekOnServer } from "@/lib/peek";
import styles from "./product.module.css";

// The loading screen for a product page. It has the same layout as the real page, so
// nothing jumps when the real content arrives. If the visitor tapped a product card a
// moment ago, we already know its photo, name and price and show them straight away.
export default function ProductSkeleton() {
  const raw = useSyncExternalStore(noSubscribe, readPeek, noPeekOnServer);
  const peek = raw ? JSON.parse(raw) : null;

  return (
    <div className={styles.page} aria-busy="true">
      <div className={`${styles.crumbs} ${styles.skLine}`} style={{ width: 140 }} />

      <div className={styles.layout}>
        {peek ? (
          <div className={styles.art}>
            <ProductArt product={peek} />
          </div>
        ) : (
          <div className={`${styles.art} ${styles.sk}`} />
        )}

        <div className={styles.info}>
          {peek ? (
            <>
              <h1>{peek.name}</h1>
              <p className={styles.price}>{formatPrice(peek.price)}</p>
            </>
          ) : (
            <>
              <div className={`${styles.skLine} ${styles.skTitle}`} />
              <div className={`${styles.skLine} ${styles.skPrice}`} />
            </>
          )}
          <div className={`${styles.skLine}`} style={{ width: "92%" }} />
          <div className={`${styles.skLine}`} style={{ width: "78%" }} />
          <div className={`${styles.skLine}`} style={{ width: "60%", marginBottom: 28 }} />
          <div className={styles.skSizes}>
            <span className={styles.sk} />
            <span className={styles.sk} />
            <span className={styles.sk} />
            <span className={styles.sk} />
          </div>
          <div className={`${styles.sk} ${styles.skButton}`} />
        </div>
      </div>
    </div>
  );
}
