// The choices the product form offers. One place to change them.

// Which sizes a product has depends on its category.
// Bottoms use waist sizes in inches; everything else uses letters.
// To add a size (say 36), add it to the list here. Nothing else needs to change.
const LETTER_SIZES = ["S", "M", "L", "XL"];
const SIZES_BY_CATEGORY = { bottoms: ["28", "30", "32", "34"] };
export const sizesFor = (category) => SIZES_BY_CATEGORY[category] ?? LETTER_SIZES;

// "Shape" decides which placeholder garment is drawn until real photos exist.
export const TYPES = [
  { value: "tee", label: "T-shirt" },
  { value: "hoodie", label: "Hoodie" },
  { value: "pants", label: "Pants" },
  { value: "jacket", label: "Jacket" },
];

// How many photos one product can have.
export const MAX_IMAGES = 6;
