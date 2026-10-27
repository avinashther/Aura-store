"use client";

// The shopper's bag. It lives in the browser (localStorage), so it works without
// an account and survives closing the tab. It only stores WHAT was picked:
//   [{ slug: "moss-boxy-tee", size: "M", qty: 2 }]
// Prices and names are NEVER stored here. The server looks those up from the
// database when it shows or charges for the bag, so nobody can edit a price.

import { useSyncExternalStore } from "react";

const KEY = "aura-bag-v1";
const MAX_LINES = 50;
const MAX_QTY = 99;
const EMPTY = [];

let cache = { raw: null, items: EMPTY };
const listeners = new Set();

const valid = (i) =>
  i &&
  typeof i.slug === "string" &&
  typeof i.size === "string" &&
  Number.isInteger(i.qty) &&
  i.qty >= 1 &&
  i.qty <= MAX_QTY;

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.items; // same text = same array (keeps React calm)
    let items = EMPTY;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed.filter(valid).slice(0, MAX_LINES);
    }
    cache = { raw, items };
    return items;
  } catch {
    return EMPTY; // private mode, blocked storage, or broken data
  }
}

function write(items) {
  try {
    const raw = JSON.stringify(items);
    window.localStorage.setItem(KEY, raw);
    cache = { raw, items };
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // another tab changed the bag
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

// React hooks: components using these re-draw whenever the bag changes.
export const useBagItems = () => useSyncExternalStore(subscribe, read, () => EMPTY);
export const useBagCount = () => useBagItems().reduce((sum, i) => sum + i.qty, 0);

// Add one piece. `max` = how many are in stock for that size.
export function addToBag(slug, size, max) {
  const items = [...read()];
  const line = items.find((i) => i.slug === slug && i.size === size);
  const have = line?.qty ?? 0;
  if (have >= Math.min(max, MAX_QTY)) return { ok: false, reason: "max", have };
  if (line) items[items.indexOf(line)] = { ...line, qty: have + 1 };
  else if (items.length >= MAX_LINES) return { ok: false, reason: "full" };
  else items.push({ slug, size, qty: 1 });
  return write(items) ? { ok: true } : { ok: false, reason: "storage" };
}

export function setQty(slug, size, qty) {
  const q = Math.min(Math.max(Math.trunc(qty), 0), MAX_QTY);
  const items = read()
    .map((i) => (i.slug === slug && i.size === size ? { ...i, qty: q } : i))
    .filter((i) => i.qty > 0);
  write(items);
}

export const removeFromBag = (slug, size) => setQty(slug, size, 0);
export const clearBag = () => write([]);
