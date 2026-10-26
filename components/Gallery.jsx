"use client";

import { useState } from "react";
import { cloudinaryUrl } from "@/lib/products";
import styles from "./Gallery.module.css";

// The big photo on a product page, with small thumbnails to switch between photos.
// A client component because it remembers which photo is selected.
export default function Gallery({ images, name }) {
  const [current, setCurrent] = useState(0);

  return (
    <div>
      <div className={styles.main}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cloudinaryUrl(images[current], 1000)} alt={`${name}, photo ${current + 1}`} />
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
