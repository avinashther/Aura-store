"use client";

// "use client" = this component runs in the browser (it needs scroll events, animation
// frames and state). Components without it run on the server.

import { useEffect, useRef } from "react";
import { LETTERS } from "@/lib/letters";
import Logo from "./Logo";
import styles from "./Hero.module.css";

/* ---- Settings you can tweak ---------------------------------------------- */
const SPIN_TURNS = 1; //    full turns the word makes on its way into the header
const SMOOTHING = 14; //    higher = follows the scroll more tightly, lower = floatier

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* How this works
   1. The page first shows a FLAT logo (an SVG), so something is on screen instantly.
   2. In the background we download the 3D scene (three.js). When it's ready, the 3D
      word fades in on top of the flat one, in exactly the same place and size.
   3. As you scroll, the word rises with the page, shrinks, and spins once, so it lands
      exactly on the small logo in the header. Then we hide it and the header logo
      takes over (data-hero-logo="docked" on <html>).
   If 3D isn't available, or the person asked for less motion, step 1 is all they get
   (the flat logo still shrinks into the header, just without the spin). */
export default function Hero() {
  const heroRef = useRef(null);
  const wrapRef = useRef(null); //   an empty slot that keeps the word's place in the layout
  const flatRef = useRef(null); //   the flat logo
  const glRef = useRef(null); //     an empty box; the 3D canvas is created inside it (see below)
  const shadowRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const hero = heroRef.current;
    const wrap = wrapRef.current;
    const flat = flatRef.current;
    const glHost = glRef.current;
    const shadow = shadowRef.current;
    if (!hero || !wrap || !flat || !glHost || !shadow) return;

    // A brand-new canvas every time this effect starts. Next.js keeps the home page in memory
    // when you open a product, and starts it again when you come back. A canvas whose 3D
    // context was shut down can't be reused, so reusing it left the flat logo showing.
    const canvas = document.createElement("canvas");
    canvas.className = styles.gl;
    canvas.setAttribute("aria-hidden", "true");
    glHost.appendChild(canvas);
    flat.style.visibility = ""; // undo anything a previous run did to the flat logo
    flat.style.transform = "";

    // Less motion: the header logo is simply always there, and the hero logo stays put.
    if (window.matchMedia(REDUCED_MOTION).matches) {
      root.dataset.heroLogo = "docked";
      return () => { canvas.remove(); root.dataset.heroLogo = "off"; };
    }

    let alive = true;
    let scene = null; // set once the 3D scene is ready
    let raf = 0;
    let last = 0;
    let shown = 0; //  smoothed scroll progress (0 = resting in the hero, 1 = in the header)
    let started = 0; // when the 3D entrance began
    let px = 0, py = 0, cx = 0, cy = 0; // pointer target / current, -1…1
    let hideFlatTimer = 0;

    const measure = () => {
      const logo = document.querySelector("[data-site-logo] svg");
      if (!logo) return null;
      const t = logo.getBoundingClientRect(); // where the small logo is
      const w = wrap.getBoundingClientRect(); //  where the big word would sit if it didn't move
      if (!w.height) return null;
      const scrollY = window.scrollY;
      const distance = w.top + scrollY + w.height / 2 - (t.top + t.height / 2);
      return {
        target: distance > 0 ? clamp01(scrollY / distance) : 1,
        x: w.left + w.width / 2,
        // rises with the page, but never goes above the small logo
        y: Math.max(w.top + w.height / 2, t.top + t.height / 2),
        endScale: t.height / w.height,
        unit: w.height / 880, // screen pixels per artwork unit
      };
    };

    const frame = (now) => {
      raf = 0;
      const m = measure();
      if (!m) { raf = requestAnimationFrame(frame); return; }
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;

      // Follow the scroll with a little glide (frame-rate independent).
      if (scene) shown += (m.target - shown) * (1 - Math.exp(-SMOOTHING * dt));
      else shown = m.target;
      if (Math.abs(m.target - shown) < 0.0005) shown = m.target;

      const scale = 1 + (m.endScale - 1) * shown;
      const docked = shown >= 1;
      shadow.style.opacity = String(clamp01(1 - shown * 1.8));

      if (scene) {
        cx += (px - cx) * 0.07;
        cy += (py - cy) * 0.07;
        const t = now / 1000;
        const calm = 1 - smooth(0, 0.9, shown); // floating and tilt settle as it docks
        const spin = smooth(0, 1, shown) * SPIN_TURNS * Math.PI * 2; // ends exactly facing front
        const intro = 1 - Math.pow(1 - clamp01((now - started) / 1400), 3);
        scene.update({
          x: m.x,
          y: m.y,
          unit: m.unit * scale,
          rotX: (Math.cos(t * 0.5) * 0.035 - cy * 0.12 - 0.07) * calm,
          rotY: (Math.sin(t * 0.7) * 0.12 - cx * 0.2 + 0.12) * calm - (1 - intro) * 0.6 + spin,
          time: t,
          calm,
          flat: smooth(0.82, 1, shown),
          intro,
        });
        scene.render();
        canvas.style.visibility = docked ? "hidden" : "visible";
      } else {
        flat.style.transform = `scale(${scale})`;
        flat.style.visibility = docked ? "hidden" : "visible";
      }

      root.dataset.heroLogo = docked ? "docked" : "flying";
      // Keep animating while the 3D word is showing (it floats). The flat one only moves on scroll.
      if (scene && !docked) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    // ---- download the 3D scene in the background ------------------------------
    import("./heroScene")
      .then(({ createScene }) => {
        if (!alive) return;
        scene = createScene(canvas, LETTERS); // throws when WebGL is missing → we keep the flat logo
        scene.resize(window.innerWidth, window.innerHeight);
        started = performance.now();
        canvas.dataset.ready = "true"; // fades the 3D word in
        // once it is fully in, remove the flat one underneath
        hideFlatTimer = window.setTimeout(() => { flat.style.visibility = "hidden"; }, 600);
        kick();
      })
      .catch((e) => console.warn("3D hero not available, keeping the flat logo:", e));

    // ---- listeners -----------------------------------------------------------
    const onResize = () => { scene?.resize(window.innerWidth, window.innerHeight); kick(); };
    const setPointer = (x, y) => {
      const r = hero.getBoundingClientRect();
      px = ((x - r.left) / r.width - 0.5) * 2;
      py = ((y - r.top) / r.height - 0.5) * 2;
    };
    const onMouse = (e) => setPointer(e.clientX, e.clientY);
    const onTouch = (e) => setPointer(e.touches[0].clientX, e.touches[0].clientY);
    const onLeave = () => { px = 0; py = 0; };

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    hero.addEventListener("mousemove", onMouse);
    hero.addEventListener("touchmove", onTouch, { passive: true });
    hero.addEventListener("mouseleave", onLeave);
    kick();

    // Cleanup when the component goes away, so nothing keeps running.
    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(hideFlatTimer);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      hero.removeEventListener("mousemove", onMouse);
      hero.removeEventListener("touchmove", onTouch);
      hero.removeEventListener("mouseleave", onLeave);
      scene?.dispose();
      canvas.remove();
      root.dataset.heroLogo = "off"; // Next keeps old pages in memory, so say "I'm gone"
    };
  }, []);

  return (
    <section className={styles.hero} ref={heroRef} aria-labelledby="hero-title" data-hero>
      <div className={styles.wrap} ref={wrapRef}>
        <div className={styles.shadowFade} ref={shadowRef}>
          <div className={styles.shadow} />
        </div>
        <h1 id="hero-title" className={styles.fly} ref={flatRef} aria-label="AURA">
          <Logo className={styles.flat} height={100} />
        </h1>
      </div>
      <div ref={glRef} aria-hidden="true" />

      <div className={styles.bottom}>
        <a href="#new-arrivals" className={styles.cta}>
          Shop new arrivals
        </a>
        <p className={styles.tag}>New Season &middot; Clothing</p>
      </div>
    </section>
  );
}
