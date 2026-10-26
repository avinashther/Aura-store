import Link from "next/link";
import { CATEGORIES } from "@/lib/products";
import { saveProduct } from "./actions";
import { SIZES, TYPES } from "./options";
import styles from "./admin.module.css";

// One form for both "Add product" (no product) and "Edit product" (product given).
// It has no client-side code at all: the browser just submits it to saveProduct.
export default function ProductForm({ product, error }) {
  const stock = Object.fromEntries((product?.variants ?? []).map((v) => [v.size, v.stock]));

  return (
    <form action={saveProduct} className={styles.form}>
      {product && <input type="hidden" name="id" value={product.id} />}
      {error && <p className={styles.error} role="alert">{error}</p>}

      <label>
        Name
        <input name="name" defaultValue={product?.name} required maxLength={100} />
      </label>

      <label>
        Description
        <textarea name="description" defaultValue={product?.description} rows={3} required maxLength={1000} />
      </label>

      <label>
        Price (₹)
        <input name="price" type="number" min="1" step="1" inputMode="numeric" defaultValue={product?.price} required />
      </label>

      <div className={styles.row}>
        <label>
          Category
          <select name="category" defaultValue={product?.category ?? CATEGORIES[0].slug}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </label>

        <label>
          Shape (until photos)
          <select name="type" defaultValue={product?.type ?? TYPES[0].value}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label>
          Colour
          <input name="color" type="color" defaultValue={product?.color ?? "#3c572b"} />
        </label>
      </div>

      <fieldset>
        <legend>Stock per size (0 = sold out)</legend>
        <div className={styles.row}>
          {SIZES.map((size) => (
            <label key={size}>
              {size}
              <input name={`stock_${size}`} type="number" min="0" step="1" inputMode="numeric" defaultValue={stock[size] ?? 0} />
            </label>
          ))}
        </div>
      </fieldset>

      <label>
        Details (one per line)
        <textarea name="details" rows={4} defaultValue={product?.details.join("\n")} />
      </label>

      <div className={styles.checks}>
        <label className={styles.check}>
          <input type="checkbox" name="isNew" defaultChecked={product?.isNew ?? false} />
          Show in &ldquo;New arrivals&rdquo;
        </label>
        <label className={styles.check}>
          <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} />
          Visible in the shop
        </label>
      </div>

      <div className={styles.row}>
        <button type="submit" className={styles.primary}>
          {product ? "Save changes" : "Add product"}
        </button>
        <Link href="/admin" className={styles.ghost}>Cancel</Link>
      </div>
    </form>
  );
}
