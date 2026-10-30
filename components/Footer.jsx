import Link from "next/link";
import { CATEGORIES } from "@/lib/products";
import { whatsappReady, whatsappUrl } from "@/lib/whatsapp";
import styles from "./Footer.module.css";

// Update this once a year. (Next.js 16 does not allow new Date() in server
// components during the build, so a plain number is the simple fix.)
const YEAR = 2026;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className={styles.logo}>AURA</p>
          <p className={styles.blurb}>New season clothing.</p>
        </div>

        <nav aria-label="Shop categories">
          <h2>Shop</h2>
          <ul>
            <li><Link href="/shop">All products</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* These pages are written in Phase 10 (legal pages) */}
        <nav aria-label="Help">
          <h2>Help</h2>
          <ul>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
            <li>
              {whatsappReady ? (
                <a href={whatsappUrl("Hi! I have a question about AURA.")} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              ) : (
                <a href="#">Contact</a>
              )}
            </li>
          </ul>
        </nav>
      </div>

      <p className={styles.legal}>
        &copy; {YEAR} AURA. All rights reserved.
      </p>
    </footer>
  );
}
