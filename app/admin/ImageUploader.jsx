"use client";

// Lets the admin pick photos, uploads them to Cloudinary, and keeps the list of
// photo addresses. Each address becomes a hidden form field called "images",
// so the normal "Save" button sends them to saveProduct along with everything else.
// It's a client component because it remembers state (which photos, uploading or not).

import { useState } from "react";
import { cloudinaryUrl } from "@/lib/products";
import { getUploadSignature } from "./actions";
import { MAX_IMAGES } from "./options";
import styles from "./admin.module.css";

const MAX_MB = 10; // Cloudinary's free plan limit per photo

export default function ImageUploader({ initial = [] }) {
  const [images, setImages] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file) {
    const sig = await getUploadSignature(); // 1. ask our server for permission
    const body = new FormData(); // 2. send the photo straight to Cloudinary
    body.append("file", file);
    body.append("api_key", sig.apiKey);
    body.append("timestamp", sig.timestamp);
    body.append("folder", sig.folder);
    body.append("allowed_formats", sig.allowed_formats);
    body.append("signature", sig.signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body,
    });
    if (!res.ok) throw new Error("Cloudinary refused the upload.");
    const data = await res.json();
    return data.secure_url; // 3. the photo's web address
  }

  async function onPick(event) {
    const files = [...event.target.files];
    event.target.value = ""; // lets the same file be picked again later
    if (!files.length) return;

    setMessage("");
    setBusy(true);
    let count = images.length;
    try {
      for (const file of files) {
        if (count >= MAX_IMAGES) {
          setMessage(`Only ${MAX_IMAGES} photos per product.`);
          break;
        }
        if (!file.type.startsWith("image/")) {
          setMessage(`${file.name} is not a photo.`);
          continue;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
          setMessage(`${file.name} is bigger than ${MAX_MB} MB.`);
          continue;
        }
        const url = await upload(file);
        setImages((prev) => [...prev, url]);
        count += 1;
      }
    } catch (err) {
      setMessage(err.message || "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const remove = (url) => setImages((prev) => prev.filter((u) => u !== url));
  const makeMain = (url) => setImages((prev) => [url, ...prev.filter((u) => u !== url)]);

  return (
    <fieldset>
      <legend>Photos (the first one is the main photo)</legend>

      {images.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      {images.length > 0 && (
        <ul className={styles.photos}>
          {images.map((url, i) => (
            <li key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cloudinaryUrl(url, 240)} alt={`Photo ${i + 1}`} />
              <div className={styles.photoActions}>
                {i === 0 ? <span>Main</span> : <button type="button" onClick={() => makeMain(url)}>Make main</button>}
                <button type="button" onClick={() => remove(url)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={onPick}
        disabled={busy || images.length >= MAX_IMAGES}
        aria-label="Upload photos"
      />
      {busy && <p role="status">Uploading… wait before saving.</p>}
      {message && <p className={styles.error} role="alert">{message}</p>}
    </fieldset>
  );
}
