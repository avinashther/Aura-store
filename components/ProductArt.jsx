import { cloudinaryUrl } from "@/lib/products";

// Draws a simple garment picture so we can build the shop before real photos
// exist. If a product has an `image`, that photo is shown instead.

const SHAPES = {
  tee: "M62 40 L90 30 Q100 46 110 30 L138 40 L176 78 L152 100 L140 90 V206 H60 V90 L48 100 L24 78 Z",
  hoodie: "M62 44 L90 34 Q100 50 110 34 L138 44 L178 150 L152 160 L138 104 V208 H62 V104 L48 160 L22 150 Z",
  pants: "M62 28 H138 L148 218 H108 L100 92 L92 218 H52 Z",
  jacket: "M60 42 L88 32 L100 52 L112 32 L140 42 L180 152 L154 162 L140 106 V210 H60 V106 L46 162 L20 152 Z",
};

export default function ProductArt({ product }) {
  if (product.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={cloudinaryUrl(product.image, 700)} alt={product.name} loading="lazy" />;
  }

  return (
    <svg viewBox="0 0 200 240" role="img" aria-label={product.name}>
      <path
        d={SHAPES[product.type]}
        fill={product.color}
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {product.type === "hoodie" && (
        <path d="M80 36 Q100 8 120 36 Q100 56 80 36 Z" fill="rgba(0,0,0,0.16)" />
      )}
      {product.type === "jacket" && (
        <path d="M100 52 V210" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
      )}
      {product.type === "pants" && (
        <path d="M62 44 H138" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
      )}
    </svg>
  );
}
