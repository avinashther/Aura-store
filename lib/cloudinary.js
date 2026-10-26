// Cloudinary helpers (server only, because they use the secret key).
//
// How uploads work:
//  1. The admin's browser asks OUR server for a "signature" (only the admin can get one).
//  2. The browser then sends the photo straight to Cloudinary with that signature.
//  3. Cloudinary checks the signature, stores the photo and returns its web address.
//  4. We save only that address in our database.
// The secret key never leaves the server, and big photos never pass through our server.

import "server-only";
import { createHash } from "node:crypto";

export const UPLOAD_FOLDER = "aura";
export const ALLOWED_FORMATS = "jpg,jpeg,png,webp,avif";

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env"
    );
  }
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary's rule: sort the settings alphabetically, join them as
// "name=value&name=value", add the secret on the end, and hash it with SHA-1.
export function signParams(params, apiSecret) {
  const text = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(text + apiSecret).digest("hex");
}
