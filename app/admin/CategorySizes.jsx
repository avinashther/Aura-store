"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/products";
import { sizesFor } from "./options";
import styles from "./admin.module.css";

// The Category dropdown and the "stock per size" boxes belong together: pick "Bottoms" and the
// boxes change to 28 / 30 / 32. A client component because it reacts to the dropdown.
export default function CategorySizes({ defaultCategory, stock }) {
  const [category, setCategory] = useState(defaultCategory);
  const sizes = sizesFor(category);

  return (
    <>
      <label>
        Category
        <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>
          Stock per size (0 = sold out){category === "bottoms" ? ". Sizes are waist in inches." : ""}
        </legend>
        <div className={styles.row}>
          {sizes.map((size) => (
            <label key={`${category}-${size}`}>
              {size}
              <input
                name={`stock_${size}`}
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                defaultValue={stock[size] ?? 0}
              />
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
