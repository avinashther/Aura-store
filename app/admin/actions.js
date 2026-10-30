"use server";

// Server actions = functions that run on the server when a form is submitted.
// The browser never sees this code. Each one re-checks that the person is the admin,
// because anyone can send a request to an action without using our pages.

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/products";
import { endSession, passwordIsRight, requireAdmin, startSession } from "@/lib/adminAuth";
import { ALLOWED_FORMATS, UPLOAD_FOLDER, cloudinaryConfig, signParams } from "@/lib/cloudinary";
import { MAX_IMAGES, SIZES, TYPES } from "./options";

export async function login(formData) {
  if (!passwordIsRight(formData.get("password"))) {
    await new Promise((r) => setTimeout(r, 800)); // slows down password guessing
    redirect("/admin/login?error=1");
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// Gives the admin's browser a one-time permission slip to upload ONE photo to Cloudinary.
// Without a valid admin login, nobody can get one.
export async function getUploadSignature() {
  await requireAdmin();
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { allowed_formats: ALLOWED_FORMATS, folder: UPLOAD_FOLDER, timestamp };
  return {
    cloudName,
    apiKey,
    ...params,
    signature: signParams(params, apiSecret),
  };
}

// "Moss Boxy Tee!" → "moss-boxy-tee"
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

async function uniqueSlug(name) {
  const base = slugify(name) || "product";
  let slug = base;
  for (let n = 2; await prisma.product.findUnique({ where: { slug } }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}

// Reads the form, checks every field, and returns either { error } or { data }.
function readForm(formData) {
  const text = (key) => String(formData.get(key) ?? "").trim();
  const name = text("name");
  const description = text("description");
  const price = Number(text("price"));
  const category = text("category");
  const type = text("type");
  const color = text("color");
  const details = text("details")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!name || name.length > 100) return { error: "Name is required (max 100 letters)." };
  if (!description || description.length > 1000) return { error: "Description is required (max 1000 letters)." };
  if (!Number.isInteger(price) || price < 1 || price > 1_000_000) return { error: "Price must be a whole number in rupees, like 1299." };
  if (!CATEGORIES.some((c) => c.slug === category)) return { error: "Pick a category." };
  if (!TYPES.some((t) => t.value === type)) return { error: "Pick a shape." };
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Pick a colour." };
  if (details.length > 10 || details.some((l) => l.length > 120)) return { error: "Details: max 10 lines, 120 letters each." };

  // Photos must be addresses on OUR Cloudinary account, nothing else.
  const images = formData.getAll("images").map(String);
  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (images.length > MAX_IMAGES) return { error: `Max ${MAX_IMAGES} photos per product.` };
  if (images.some((url) => !process.env.CLOUDINARY_CLOUD_NAME || !url.startsWith(prefix) || url.length > 500)) {
    return { error: "One of the photos is not a valid upload. Remove it and upload it again." };
  }

  const stock = {};
  for (const size of SIZES) {
    const n = Number(text(`stock_${size}`) || 0);
    if (!Number.isInteger(n) || n < 0 || n > 9999) return { error: `Stock for ${size} must be a whole number, 0 or more.` };
    stock[size] = n;
  }

  return {
    data: {
      name,
      description,
      price,
      category,
      type,
      color: color.toLowerCase(),
      details,
      images,
      isNew: formData.get("isNew") === "on",
      isActive: formData.get("isActive") === "on",
    },
    stock,
  };
}

// Used by both "Add product" and "Edit product".
export async function saveProduct(formData) {
  await requireAdmin();

  const id = Number(formData.get("id") || 0);
  const back = id ? `/admin/products/${id}` : "/admin/products/new";
  const { data, stock, error } = readForm(formData);
  if (error) redirect(`${back}?error=${encodeURIComponent(error)}`);

  if (id) {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) redirect("/admin");
    // One transaction = either everything saves or nothing does.
    await prisma.$transaction([
      prisma.product.update({ where: { id }, data }),
      ...SIZES.map((size) =>
        prisma.variant.upsert({
          where: { productId_size: { productId: id, size } },
          update: { stock: stock[size] },
          create: { productId: id, size, stock: stock[size] },
        })
      ),
    ]);
  } else {
    await prisma.product.create({
      data: {
        ...data,
        slug: await uniqueSlug(data.name),
        variants: { create: SIZES.map((size) => ({ size, stock: stock[size] })) },
      },
    });
  }

  updateTag("products"); // throw away the remembered pages so the shop shows the change now
  redirect("/admin?saved=1");
}

