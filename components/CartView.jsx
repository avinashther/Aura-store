"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBagLines } from "@/app/cart/actions";
import { removeFromBag, setQty, useBagItems } from "@/lib/cartStore";
import { formatPrice } from "@/lib/products";
import { bagMessage, openWhatsApp, whatsappReady } from "@/lib/whatsapp";
import ProductArt from "./ProductArt";
import styles from "./CartView.module.css";

// The bag page. The bag itself (what was picked) lives in the browser;
// names, prices and stock are fetched from the server each time it changes.
export default function CartView() {
  const items = useBagItems();
  const [data, setData] = useState(null);
  const [notice, setNotice] = useState(false); // stays on screen once something was adjusted

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    getBagLines(items).then((result) => {
      if (cancelled) return;
      setData(result);
      // Tidy the bag: drop products that no longer exist, lower counts that
      // are more than what is in stock, and tell the shopper.
      if (result.lines.some((l) => l.missing || l.stock === 0 || l.qty < l.wanted)) setNotice(true);
      for (const line of result.lines) {
        if (line.missing || line.stock === 0) removeFromBag(line.slug, line.size);
        else if (line.qty < line.wanted) setQty(line.slug, line.size, line.qty);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <h1>Your bag</h1>
        <p>Your bag is empty.</p>
        <p>
          <Link href="/shop"><u>Keep shopping</u></Link>
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <h1>Your bag</h1>
        <p>Loading…</p>
      </div>
    );
  }

  const lines = data.lines.filter((l) => !l.missing && l.stock > 0);

  return (
    <div className={styles.page}>
      <h1>Your bag</h1>

      {notice && (
        <p className={styles.notice} role="status">
          Some items changed because they are sold out or we have fewer left than you chose.
        </p>
      )}

      {lines.length === 0 ? (
        <p>
          Your bag is empty. <Link href="/shop"><u>Keep shopping</u></Link>
        </p>
      ) : (
        <>
          <ul className={styles.lines}>
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`} className={styles.line}>
                <Link href={`/product/${l.slug}`} className={styles.thumb}>
                  <ProductArt product={l} />
                </Link>

                <div className={styles.info}>
                  <Link href={`/product/${l.slug}`} className={styles.name}>{l.name}</Link>
                  <p>Size {l.size}</p>
                  <p>{formatPrice(l.price)}</p>

                  <div className={styles.qty}>
                    <button
                      type="button"
                      aria-label={`One less ${l.name}`}
                      onClick={() => setQty(l.slug, l.size, l.qty - 1)}
                    >
                      −
                    </button>
                    <span aria-live="polite">{l.qty}</span>
                    <button
                      type="button"
                      aria-label={`One more ${l.name}`}
                      disabled={l.qty >= l.stock}
                      onClick={() => setQty(l.slug, l.size, l.qty + 1)}
                    >
                      +
                    </button>
                    <button type="button" className={styles.remove} onClick={() => removeFromBag(l.slug, l.size)}>
                      Remove
                    </button>
                  </div>
                  {l.qty >= l.stock && <p className={styles.small}>Only {l.stock} left</p>}
                </div>

                <p className={styles.total}>{formatPrice(l.price * l.qty)}</p>
              </li>
            ))}
          </ul>

          <div className={styles.summary}>
            <p className={styles.subtotal}>
              <span>Subtotal</span> <strong>{formatPrice(data.subtotal)}</strong>
            </p>
            <p className={styles.small}>
              Delivery and payment are arranged with the seller on WhatsApp. Nothing is charged here.
            </p>
            <button
              type="button"
              className={styles.checkout}
              disabled={!whatsappReady}
              onClick={() => openWhatsApp(bagMessage(lines, window.location.origin))}
            >
              Order on WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
}
