// Builds the WhatsApp links and the messages that arrive in the seller's chat.
// Works in the browser and on the server (no secrets here).

import { WHATSAPP_NUMBER } from "@/lib/shop";
import { formatPrice } from "@/lib/products";

export const whatsappReady = WHATSAPP_NUMBER.length >= 11;

// https://wa.me/<number>?text=<message>  opens WhatsApp with the message already typed.
// The customer only has to press send.
export function whatsappUrl(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const ASK = "Is it available? Please tell me how to pay and when it can be delivered.";
const ASK_BAG = "Are these available? Please tell me how to pay and when they can be delivered.";

// One product, one size. `origin` is the site address, e.g. https://aura.example
export function productMessage(product, size, origin) {
  return [
    "Hi! I'd like to order from AURA:",
    "",
    `*${product.name}* - size ${size}`,
    `Price: ${formatPrice(product.price)}`,
    `${origin}/product/${product.slug}`,
    "",
    ASK,
  ].join("\n");
}

// The whole bag. `lines` are the checked lines from the server (real names and prices).
export function bagMessage(lines, origin) {
  const MAX = 15; // WhatsApp links have a length limit
  const shown = lines.slice(0, MAX);
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const out = ["Hi! I'd like to order from AURA:", ""];
  shown.forEach((l, i) => {
    out.push(`${i + 1}. *${l.name}* - size ${l.size} x ${l.qty} - ${formatPrice(l.price * l.qty)}`);
    out.push(`   ${origin}/product/${l.slug}`);
  });
  if (lines.length > MAX) out.push(`...and ${lines.length - MAX} more items`);
  out.push("", `Items total: ${formatPrice(total)} (delivery extra)`, "", ASK_BAG);
  return out.join("\n");
}

// Opens WhatsApp in a new tab (or the app, on a phone).
export function openWhatsApp(text) {
  window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
}
