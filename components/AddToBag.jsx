"use client";

import Link from "next/link";
import { useState } from "react";
import { addToBag } from "@/lib/cartStore";
import { openWhatsApp, productMessage, whatsappReady } from "@/lib/whatsapp";
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
    const result = addToBag(product.slug, size, product.sizes[size]);
    if (result.ok) {
      setMessage(
        <>
          Added: {product.name}, size {size}.{" "}
          <Link href="/cart"><u>View bag</u></Link>
        </>
      );
    } else if (result.reason === "max") {
      setMessage(`You already have all ${result.have} we have in size ${size}.`);
    } else if (result.reason === "full") {
      setMessage("Your bag is full. Please send it on WhatsApp first.");
    } else {
      setMessage("Couldn't save your bag. Please allow site storage in your browser.");
    }
  };

  // "Order on WhatsApp": opens a chat with the seller, with this product and size typed in.
  const chat = () => {
    if (!size) {
      setMessage("Please pick a size first.");
      return;
    }
    openWhatsApp(productMessage(product, size, window.location.origin));
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

      <button type="button" className={styles.add} onClick={chat} disabled={!whatsappReady}>
        Order on WhatsApp
      </button>
      <button type="button" className={styles.secondary} onClick={add}>
        Add to bag
      </button>
      <p className={styles.trust}>
        Chat with us first. We confirm size, price and delivery with you on WhatsApp before you pay anything.
      </p>
      {!whatsappReady && process.env.NODE_ENV !== "production" && (
        <p className={styles.devNote}>
          Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env (then restart) to turn this button on.
        </p>
      )}

      <p className={styles.message} role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
