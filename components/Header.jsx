"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBagCount } from "@/lib/cartStore";
import styles from "./Header.module.css";

// Edit these arrays to change the menu.
// "#" links are placeholders for pages we build in later phases.
const LEFT_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "New in", href: "/#new-arrivals" },
  { label: "Our story", href: "/#story" },
];

const RIGHT_LINKS = [{ label: "Search", href: "#" }];

export default function Header() {
  const [open, setOpen] = useState(false); // is the mobile menu open?
  const cartCount = useBagCount(); // how many pieces are in the bag

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
              <Link href={l.href}>{l.label}</Link>
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

        {/* Small logo in the middle, always links home */}
        <Link href="/" className={styles.brand} aria-label="AURA home">
          AURA
        </Link>

        {/* Right side */}
        <ul className={`${styles.links} ${styles.right}`}>
          {RIGHT_LINKS.map((l) => (
            <li key={l.label} className={styles.desktopOnly}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
          <li>
            <Link href="/cart">Bag ({cartCount})</Link>
          </li>
        </ul>
      </nav>

      {open && (
        <ul id="mobile-menu" className={`${styles.panel} ${styles.mobileOnly}`}>
          {[...LEFT_LINKS, ...RIGHT_LINKS].map((l) => (
            <li key={l.label}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
