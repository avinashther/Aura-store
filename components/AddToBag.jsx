"use client";

import { useState } from "react";
import styles from "./AddToBag.module.css";

// The size picker + "Add to bag" button.
// It's a client component because it remembers what the shopper clicked.
export default function AddToBag({ product }) {
  const [size, setSize] = useState(null);
  const [message, setMessage] = useState("");

  const pick = (s) => {
    setSize(s);
    setMessage("");
  };

  const add = () => {
    if (!size) {
      setMessage("Please pick a size first.");
      return;
    }
    // Phase 6 will save this to a real cart. For now we only confirm.
    setMessage(`Added: ${product.name}, size ${size}. (The real bag arrives in Phase 6.)`);
  };

  return (
    <div>
      <p className={styles.label} id="size-label">Size</p>
      <div className={styles.sizes} role="radiogroup" aria-labelledby="size-label">
        {Object.entries(product.sizes).map(([s, qty]) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={size === s}
            disabled={qty === 0}
            className={styles.size}
            onClick={() => pick(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <button type="button" className={styles.add} onClick={add}>
        Add to bag
      </button>

      <p className={styles.message} role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
