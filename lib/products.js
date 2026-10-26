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

// Cloudinary can resize a photo just by changing its web address.
// "f_auto,q_auto" = best format and quality for each browser, "w_700" = 700px wide.
// Phones then download a small file instead of a 5 MB camera photo.
export const cloudinaryUrl = (url, width = 700) =>
  url.includes("/upload/")
    ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`)
    : url;
