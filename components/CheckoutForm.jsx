"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { getBagLines } from "@/app/cart/actions";
import { placeOrder } from "@/app/(account)/checkout/actions";
import { clearBag, useBagItems } from "@/lib/cartStore";
import { INDIAN_STATES, FREE_SHIPPING_OVER, shippingFor } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import styles from "./Checkout.module.css";

// The checkout page: delivery address on one side, the order summary on the other.
// What the shopper SEES here is for information. The server re-checks everything
// when the order is placed.
export default function CheckoutForm({ defaultName }) {
  const router = useRouter();
  const items = useBagItems();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false); // stays true while we move to the confirmation page
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (placed || items.length === 0) return;
    let cancelled = false;
    getBagLines(items).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [items, placed]);

  if (placed) {
    return (
      <div className={styles.page}>
        <h1>Placing your order…</h1>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <h1>Checkout</h1>
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
        <h1>Checkout</h1>
        <p>Loading…</p>
      </div>
    );
  }

  const lines = data.lines.filter((l) => !l.missing && l.stock > 0);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  const changed = data.lines.some((l) => l.missing || l.stock === 0 || l.qty < l.wanted);

  function onSubmit(e) {
    e.preventDefault();
    if (pending) return;
    const form = new FormData(e.currentTarget);
    const address = Object.fromEntries(
      ["name", "phone", "line1", "line2", "city", "state", "pincode"].map((k) => [k, String(form.get(k) ?? "")])
    );
    setError("");
    startTransition(async () => {
      const result = await placeOrder(items, address);
      if (result.ok) {
        setPlaced(true);
        clearBag();
        router.push(`/orders/${result.id}?placed=1`);
      } else if (result.login) {
        router.push("/login?next=%2Fcheckout");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className={styles.page}>
      <h1>Checkout</h1>

      {changed && (
        <p className={styles.notice} role="status">
          Some items in your bag are sold out or low on stock. <Link href="/cart"><u>Review your bag</u></Link>
        </p>
      )}

      <div className={styles.layout}>
        <form onSubmit={onSubmit} className={styles.form} noValidate>
          <h2>Delivery address</h2>

          <label>
            Full name
            <input name="name" defaultValue={defaultName} required maxLength={80} autoComplete="name" />
          </label>
          <label>
            Mobile number
            <input name="phone" type="tel" inputMode="numeric" required maxLength={20} autoComplete="tel" placeholder="10-digit number" />
          </label>
          <label>
            Address
            <input name="line1" required maxLength={120} autoComplete="address-line1" placeholder="House no., building, street" />
          </label>
          <label>
            Area / landmark (optional)
            <input name="line2" maxLength={120} autoComplete="address-line2" />
          </label>
          <div className={styles.row}>
            <label>
              City
              <input name="city" required maxLength={60} autoComplete="address-level2" />
            </label>
            <label>
              Pincode
              <input name="pincode" inputMode="numeric" required maxLength={6} autoComplete="postal-code" />
            </label>
          </div>
          <label>
            State
            <select name="state" required defaultValue="" autoComplete="address-level1">
              <option value="" disabled>Choose state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <h2>Payment</h2>
          <p className={styles.pay}>
            <strong>Pay on delivery</strong>
            <span>Online payment (UPI, cards) is coming soon.</span>
          </p>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={styles.place} disabled={pending || lines.length === 0}>
            {pending ? "Placing order…" : `Place order · ${formatPrice(subtotal + shipping)}`}
          </button>
        </form>

        <aside className={styles.summary} aria-label="Order summary">
          <h2>Your order</h2>
          <ul>
            {lines.map((l) => (
              <li key={`${l.slug}-${l.size}`}>
                <span>
                  {l.name} <small>· {l.size} × {l.qty}</small>
                </span>
                <span>{formatPrice(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <p className={styles.sum}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p>
          <p className={styles.sum}><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></p>
          {shipping > 0 && (
            <p className={styles.hint}>Free shipping on orders of {formatPrice(FREE_SHIPPING_OVER)} or more.</p>
          )}
          <p className={`${styles.sum} ${styles.grand}`}><span>Total</span><span>{formatPrice(subtotal + shipping)}</span></p>
          <p className={styles.hint}><Link href="/cart"><u>Edit bag</u></Link></p>
        </aside>
      </div>
    </div>
  );
}
