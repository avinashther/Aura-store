"use client";

// "use client" = this component runs in the browser (it needs mouse events,
// animation frames and state). Components without it run on the server.

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { LETTERS } from "@/lib/letters";
import styles from "./Hero.module.css";

/* ---- Settings you can tweak -------------------------------------------- */
const FULL_LAYERS = 40; // how many stacked slices make the 3D depth (desktop)
const LITE_LAYERS = 24; // fewer slices on phones so cheap devices don't lag
const FRONT = "#3c572b";
const SIDE_LIGHT = [60, 87, 43]; // colour of the slice just behind the front
const SIDE_DARK = [9, 14, 6]; //   colour of the very back slice

const SMALL_SCREEN = "(max-width: 700px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Blend between the light and dark side colours. t = 0 → light, t = 1 → dark.
const shade = (t) =>
  `rgb(${SIDE_LIGHT.map((v, i) => Math.round(v + (SIDE_DARK[i] - v) * t)).join(",")})`;

/* Reads a media query and re-renders when it changes.
   The `false` at the end is what the server assumes (no screen on the server). */
function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/* One letter = a stack of SVG slices pushed back along the Z axis. */
function Letter({ letter, index, gap, layers }) {
  const gradientId = "glint" + useId().replace(/[^a-zA-Z0-9_]/g, "");

  // With fewer layers, spread them further apart so total depth stays the same
  // and thicken the outline slightly so no gaps show between slices.
  const depthScale = FULL_LAYERS / layers;
  const strokeWidth = 4 * depthScale;

  const slices = [];
  // Draw from the back (last) to the front (index 0) so the front sits on top.
  for (let i = layers - 1; i >= 0; i--) {
    const colour = i === 0 ? FRONT : shade(i / (layers - 1));
    slices.push(
      <svg
        key={i}
        viewBox={`${letter.x} 0 ${letter.w} 880`}
        aria-hidden="true"
        style={{ transform: `translateZ(calc(var(--step) * ${-i * depthScale}))` }}
      >
        {i === 0 && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2=".3">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset=".44" stopColor="#fff" stopOpacity="0" />
              <stop offset=".5" stopColor="#fff" stopOpacity=".30" />
              <stop offset=".56" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="-1.3 0; 1.3 0"
                dur="5s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
        )}

        <path
          d={letter.d}
          fillRule="evenodd"
          fill={colour}
          className={i === 0 ? styles.f : styles.fs}
          style={{ "--c": colour }}
          {...(i > 0 && {
            stroke: colour,
            strokeWidth,
            strokeLinejoin: "round",
          })}
        />

        {/* the moving shine across the front face */}
        {i === 0 && (
          <path
            d={letter.d}
            fillRule="evenodd"
            className={styles.g}
            fill={`url(#${gradientId})`}
          />
        )}
      </svg>
    );
  }

  return (
    <div
      className={styles.letter}
      style={{ "--w": letter.w, "--n": index, "--g": gap }}
    >
      {slices}
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef(null);
  const wrapRef = useRef(null); // the empty slot in the page layout (never moves or scales)
  const flyRef = useRef(null); //  the big word itself: this is what shrinks into the header
  const stageRef = useRef(null);
  const progress = useRef(0); //   0 = resting in the hero, 1 = docked in the header
  const isSmall = useMediaQuery(SMALL_SCREEN);
  const layers = isSmall ? LITE_LAYERS : FULL_LAYERS;

  // Mouse / touch parallax: the whole word tilts gently towards the pointer.
  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!hero || !stage) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return; // respect user setting

    let tx = 0, ty = 0; // target (where the pointer is, -1 … 1)
    let cx = 0, cy = 0; // current (eases towards the target)
    let frame;

    const setTarget = (x, y) => {
      const r = hero.getBoundingClientRect();
      tx = ((x - r.left) / r.width - 0.5) * 2;
      ty = ((y - r.top) / r.height - 0.5) * 2;
    };
    const onMouse = (e) => setTarget(e.clientX, e.clientY);
    const onTouch = (e) => setTarget(e.touches[0].clientX, e.touches[0].clientY);
    const onLeave = () => { tx = 0; ty = 0; };

    hero.addEventListener("mousemove", onMouse);
    hero.addEventListener("touchmove", onTouch, { passive: true });
    hero.addEventListener("mouseleave", onLeave);

    const loop = (now) => {
      const t = now / 1000;
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      const calm = 1 - progress.current; // the tilt settles flat as the word reaches the header
      const ry = (Math.sin(t * 0.7) * 7 + cx * 12 - 8) * calm;
      const rx = (Math.cos(t * 0.5) * 2 - cy * 7 + 6) * calm;
      stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    // Cleanup: runs when the component is removed, so nothing keeps running.
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("mousemove", onMouse);
      hero.removeEventListener("touchmove", onTouch);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Scroll animation: as you scroll, the big word travels up with the page while it also
  // shrinks. It is sized so it arrives exactly on the small logo in the header. When it
  // gets there we hide it and let the header's own logo take over (data-hero-logo="docked").
  useEffect(() => {
    const root = document.documentElement;
    const wrap = wrapRef.current;
    const fly = flyRef.current;
    if (!wrap || !fly) return;

    // No animation for people who asked for less motion: header logo is simply always there.
    if (window.matchMedia(REDUCED_MOTION).matches) {
      root.dataset.heroLogo = "docked";
      return () => { root.dataset.heroLogo = "off"; };
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const target = document.querySelector("[data-site-logo] svg");
      if (!target) return;
      const t = target.getBoundingClientRect(); // where the small logo is
      const w = wrap.getBoundingClientRect();   // where the big word would sit if it didn't move
      if (!w.height) return;

      const scrollY = window.scrollY;
      const startY = w.top + scrollY + w.height / 2; // centre of the word at scroll 0
      const endY = t.top + t.height / 2;             // centre of the small logo
      const distance = startY - endY;                // how far we must scroll to get there
      const p = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 1;
      progress.current = p;

      const endScale = t.height / w.height; // big letters → the small logo's height
      fly.style.transform = `scale(${1 + (endScale - 1) * p})`;
      fly.style.setProperty("--p", p);

      const docked = p >= 1;
      fly.style.visibility = docked ? "hidden" : "visible";
      root.dataset.heroLogo = docked ? "docked" : "flying";
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.dataset.heroLogo = "off"; // Next keeps the old page in memory, so say "I'm gone"
    };
  }, []);

  return (
    <section className={styles.hero} ref={heroRef} aria-labelledby="hero-title" data-hero>
      <div className={styles.wrap} ref={wrapRef}>
       <div className={styles.fly} ref={flyRef}>
        <div className={styles.shadowFade}>
          <div className={styles.shadow} />
        </div>
        <div className={styles.stage} ref={stageRef}>
          <h1 id="hero-title" className={styles.word} aria-label="AURA">
            {LETTERS.map((letter, n) => {
              // Gap between this letter and the one before it, from the artwork.
              const prev = LETTERS[n - 1];
              const gap = prev ? letter.x - (prev.x + prev.w) : 0;
              return (
                <Letter key={n} letter={letter} index={n} gap={gap} layers={layers} />
              );
            })}
          </h1>
        </div>
       </div>
      </div>

      <div className={styles.bottom}>
        <a href="#new-arrivals" className={styles.cta}>
          Shop new arrivals
        </a>
        <p className={styles.tag}>New Season &middot; Clothing</p>
      </div>
    </section>
  );
}
