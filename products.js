// Fake product data for Phase 2.
// In Phase 3 this moves into a real database, but every page keeps using the
// same shape: { slug, name, price, category, ... }.
//
// sizes = how many pieces are in stock per size (0 = sold out).
// type / color are only used to draw the placeholder picture. When you have
// real photos, add  image: "/products/moss-tee.jpg"  (file in /public/products).

export const CATEGORIES = [
  { slug: "tops", label: "Tops" },
  { slug: "bottoms", label: "Bottoms" },
  { slug: "outerwear", label: "Outerwear" },
];

export const PRODUCTS = [
  {
    slug: "moss-boxy-tee",
    name: "Moss Boxy Tee",
    price: 1299,
    category: "tops",
    type: "tee",
    color: "#3c572b",
    isNew: true,
    description: "A heavyweight tee with a boxy cut and a dropped shoulder. Sits roomy without looking sloppy.",
    details: ["100% cotton, 240 gsm", "Boxy, relaxed fit", "Machine wash cold"],
    sizes: { S: 6, M: 8, L: 4, XL: 0 },
  },
  {
    slug: "fern-hoodie",
    name: "Fern Hoodie",
    price: 2499,
    category: "tops",
    type: "hoodie",
    color: "#5d7a4a",
    isNew: true,
    description: "Soft brushed fleece inside, clean lines outside. Your everyday hoodie, in a calmer green.",
    details: ["Cotton fleece blend", "Regular fit", "Machine wash cold"],
    sizes: { S: 3, M: 5, L: 5, XL: 2 },
  },
  {
    slug: "clay-cargo-pants",
    name: "Clay Cargo Pants",
    price: 2199,
    category: "bottoms",
    type: "pants",
    color: "#b08968",
    isNew: true,
    description: "Roomy cargo pants with deep pockets and a tapered ankle.",
    details: ["Cotton twill", "Relaxed, tapered fit", "Machine wash cold"],
    sizes: { S: 4, M: 6, L: 6, XL: 3 },
  },
  {
    slug: "sage-coach-jacket",
    name: "Sage Coach Jacket",
    price: 3499,
    category: "outerwear",
    type: "jacket",
    color: "#8aa07a",
    isNew: true,
    description: "A light snap-front jacket for cool evenings. Layers over anything.",
    details: ["Water-resistant shell", "Relaxed fit", "Wipe clean or gentle wash"],
    sizes: { S: 2, M: 4, L: 3, XL: 1 },
  },
  {
    slug: "bone-heavy-tee",
    name: "Bone Heavy Tee",
    price: 1199,
    category: "tops",
    type: "tee",
    color: "#d9d5c7",
    description: "The same heavyweight cut as our Moss tee, in an off-white that goes with everything.",
    details: ["100% cotton, 240 gsm", "Boxy, relaxed fit", "Machine wash cold"],
    sizes: { S: 7, M: 9, L: 5, XL: 4 },
  },
  {
    slug: "ink-wide-trousers",
    name: "Ink Wide Trousers",
    price: 1899,
    category: "bottoms",
    type: "pants",
    color: "#1f2a1a",
    description: "Wide-leg trousers in a near-black green. Dress them up or down.",
    details: ["Cotton blend", "Wide leg", "Machine wash cold"],
    sizes: { S: 0, M: 3, L: 4, XL: 2 },
  },
  {
    slug: "sand-relaxed-hoodie",
    name: "Sand Relaxed Hoodie",
    price: 2399,
    category: "tops",
    type: "hoodie",
    color: "#c9b99a",
    description: "An oversized hoodie in warm sand. Heavy, soft and made for lazy weekends.",
    details: ["Cotton fleece blend", "Oversized fit", "Machine wash cold"],
    sizes: { S: 2, M: 4, L: 4, XL: 3 },
  },
  {
    slug: "night-overshirt",
    name: "Night Overshirt",
    price: 2999,
    category: "outerwear",
    type: "jacket",
    color: "#243322",
    description: "A thick overshirt that works as a light jacket. Dark forest green, button front.",
    details: ["Brushed cotton twill", "Regular fit", "Machine wash cold"],
    sizes: { S: 3, M: 3, L: 2, XL: 0 },
  },
];

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);

export const isSoldOut = (product) =>
  Object.values(product.sizes).every((qty) => qty === 0);

// 1299 → "₹1,299"
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export const formatPrice = (n) => inr.format(n);
