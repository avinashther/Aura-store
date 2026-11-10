import styles from "./BagIcon.module.css";

// A little paper shopping bag with rope handles, drawn as an SVG (so it is sharp at any size
// and needs no image file). Colours come from BagIcon.module.css, so they match the brand.
// It is decorative: the link that contains it carries the accessible label.
export default function BagIcon({ size = 30 }) {
  return (
    <svg
      viewBox="0 0 40 46"
      width={(size * 40) / 46}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={styles.bag}
    >
      {/* rope handles: one behind, one in front */}
      <path d="M17 17 C17 5 29 4 29 15" className={styles.rope} />
      <path d="M12 18 C12 2 24 1 24 17" className={styles.rope} />

      {/* the bag: front, darker side panel, and a soft diagonal shade like folded paper */}
      <path d="M5 16 H29 V44 H5 Z" className={styles.front} />
      <path d="M5 16 L5 44 L21 44 Z" className={styles.shade} />
      <path d="M29 16 L36 12.5 V40.5 L29 44 Z" className={styles.side} />

      {/* the two metal rings the rope goes through */}
      <circle cx="10.5" cy="19.5" r="1.7" className={styles.ring} />
      <circle cx="24" cy="19.5" r="1.7" className={styles.ring} />
    </svg>
  );
}
