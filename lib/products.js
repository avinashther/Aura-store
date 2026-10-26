// Small helpers that don't need the database.
// (The products themselves now come from the database: see lib/catalog.js.)

export const CATEGORIES = [
  { slug: "tops", label: "Tops" },
  { slug: "bottoms", label: "Bottoms" },
  { slug: "outerwear", label: "Outerwear" },
];

// A product is sold out when every size has 0 left.
export const isSoldOut = (product) =>
  Object.values(product.sizes).every((qty) => qty === 0);

// 1299 → "₹1,299"
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export const formatPrice = (n) => inr.format(n);
