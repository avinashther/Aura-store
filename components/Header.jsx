"use client";

import { useEffect, useState } from "react";
import styles from "./Header.module.css";

// Edit these arrays to change the menu. In Phase 2 the "#" links become
// real pages (/shop, /collections, /story, /account, /cart).
const LEFT_LINKS = [
  { label: "Shop", href: "#new-arrivals" },
  { label: "Collections", href: "#" },
  { label: "Our story", href: "#" },
];

const RIGHT_LINKS = [
  { label: "Search", href: "#" },
  { label: "Account", href: "#" },
];

export default function Header() {
  const [open, setOpen] = useState(false); // is the mobile menu open?
  const cartCount = 0; // will come from the cart in Phase 6

  // Close the mobile menu with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <nav className={styles.bar} aria-label="Main">
        {/* Desktop: links on the left */}
        <ul className={`${styles.links} ${styles.desktopOnly}`}>
          {LEFT_LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>

        {/* Mobile: menu button on the left */}
        <button
          type="button"
          className={`${styles.menuBtn} ${styles.mobileOnly}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>

        {/* Right side */}
        <ul className={styles.links}>
          {RIGHT_LINKS.map((l) => (
            <li key={l.label} className={styles.desktopOnly}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
          <li>
            <a href="#">Bag ({cartCount})</a>
          </li>
        </ul>
      </nav>

      {open && (
        <ul id="mobile-menu" className={`${styles.panel} ${styles.mobileOnly}`}>
          {[...LEFT_LINKS, ...RIGHT_LINKS].map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
