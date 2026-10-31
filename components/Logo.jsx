import { LETTERS } from "@/lib/letters";

// The AURA wordmark as a flat SVG, drawn from the SAME letter shapes the big 3D hero uses,
// so the small logo in the menu bar always matches the big one.
// It takes the text colour of wherever it is placed (currentColor).
const X0 = LETTERS[0].x;
const X1 = LETTERS[LETTERS.length - 1].x + LETTERS[LETTERS.length - 1].w;
const WIDTH = X1 - X0;
const HEIGHT = 880; // the artwork is 880 units tall

export default function Logo({ height = 22, className }) {
  return (
    <svg
      viewBox={`${X0} 0 ${WIDTH} ${HEIGHT}`}
      width={(height * WIDTH) / HEIGHT}
      height={height}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {LETTERS.map((letter, i) => (
        <path key={i} d={letter.d} fillRule="evenodd" />
      ))}
    </svg>
  );
}
