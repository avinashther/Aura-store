"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./ProductCard.module.css";

// The link that wraps a product card. On a normal click the card plays a quick "lift and
// glow" animation (about a quarter of a second) and THEN opens the product page.
// Ctrl/Cmd-click (open in a new tab), middle-click, and people who asked their device for
// less motion all skip the animation and just follow the link as usual.
const LAUNCH_MS = 260;

export default function CardLink({ href, children }) {
  const router = useRouter();
  const [launching, setLaunching] = useState(false);

  function onClick(e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault(); // we'll navigate ourselves, right after the animation
    if (launching) return;
    setLaunching(true);
    window.setTimeout(() => router.push(href), LAUNCH_MS);
    // Next keeps this page in memory, so if they come back with the Back button
    // the card must not still be "launched".
    window.setTimeout(() => setLaunching(false), 1500);
  }

  return (
    // .item holds the backlight, which sits BEHIND the card (.card is the link itself)
    <div className={styles.item}>
      <Link
        href={href}
        onClick={onClick}
        className={`${styles.card} ${launching ? styles.launch : ""}`}
      >
        {children}
      </Link>
    </div>
  );
}
