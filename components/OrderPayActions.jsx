"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cancelUnpaidOrder, retryPayment, verifyPayment } from "@/app/(account)/orders/actions";
import { payWithRazorpay } from "@/lib/razorpayClient";
import styles from "@/app/(account)/orders/orders.module.css";

// "Pay now" and "Cancel" for an order that is still waiting for its payment.
export default function OrderPayActions({ orderId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const started = await retryPayment(orderId);
      if (!started.ok) {
        setError(started.error);
        router.refresh();
        return;
      }
      const result = await payWithRazorpay(started.pay);
      if (result.paid) {
        const verified = await verifyPayment(orderId, result.response);
        if (!verified.ok && verified.error) setError(verified.error);
        router.replace(`/orders/${orderId}${verified.ok ? "?placed=1" : "?verify=1"}`);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (busy || !window.confirm("Cancel this order?")) return;
    setBusy(true);
    await cancelUnpaidOrder(orderId);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className={styles.payBox}>
      <div className={styles.payButtons}>
        <button type="button" className={styles.payNow} onClick={pay} disabled={busy}>
          {busy ? "Please wait…" : "Pay now"}
        </button>
        <button type="button" className={styles.cancel} onClick={cancel} disabled={busy}>
          Cancel order
        </button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
