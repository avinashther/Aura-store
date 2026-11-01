"use client";

import { useState } from "react";
import { cloudinaryUrl } from "@/lib/products";
import styles from "./Gallery.module.css";

// The big photo on a product page, with small thumbnails to switch between photos.
// A client component because it remembers which photo is selected.
// Fade the sharp photo in once it has loaded (no React state needed: we just set its opacity).
const showImage = (e) => { e.currentTarget.style.opacity = "1"; };
// If the photo finished loading before this page woke up, onLoad was missed: catch up here.
const showIfLoaded = (el) => { if (el && el.complete && el.naturalWidth) el.style.opacity = "1"; };

export default function Gallery({ images, name }) {
  const [current, setCurrent] = useState(0);

  return (
    <div>
      <div className={styles.main}>
        {/* The small photo is usually already in the browser (the product card just showed it),
            so it appears at once. The big sharp one fades in on top when it has loaded. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.under} src={cloudinaryUrl(images[current], 700)} alt="" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current}
          className={styles.over}
          src={cloudinaryUrl(images[current], 1000)}
          alt={`${name}, photo ${current + 1}`}
          fetchPriority={current === 0 ? "high" : undefined}
          onLoad={showImage}
          ref={showIfLoaded}
        />
      </div>

      {images.length > 1 && (
        <ul className={styles.thumbs}>
          {images.map((url, i) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cloudinaryUrl(url, 160)} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
