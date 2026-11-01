// "Peek": when someone taps a product card we remember its photo, name and price for a few
// seconds. The product page's loading screen uses them to show the real photo, name and
// price INSTANTLY while the rest of the page is still being fetched.
// (sessionStorage = a tiny note kept by the browser tab. It can be blocked, so every use is
// wrapped in try/catch and the site works fine without it.)

const KEY = "aura-peek";
const FRESH_MS = 8000;

export function rememberProduct(product) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...product, t: Date.now() }));
  } catch {}
}

// Returns the saved note as text (or null). Used with useSyncExternalStore, which wants
// the SAME text back every time nothing has changed.
export function readPeek() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return Date.now() - JSON.parse(raw).t < FRESH_MS ? raw : null;
  } catch {
    return null;
  }
}

export const noSubscribe = () => () => {}; // nothing changes while the page is open
export const noPeekOnServer = () => null;
