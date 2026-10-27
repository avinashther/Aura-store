"use server";

// Turns the bag (just slugs, sizes and counts) into real lines with names,
// prices, photos and stock, straight from the database.

import { prisma } from "@/lib/prisma";

export async function getBagLines(items) {
  // The browser can send anything, so check the shape before using it.
  if (!Array.isArray(items) || items.length > 50) return { lines: [], subtotal: 0 };
  const wanted = items.filter(
    (i) =>
      i &&
      typeof i.slug === "string" && i.slug.length <= 100 &&
      typeof i.size === "string" && i.size.length <= 10 &&
      Number.isInteger(i.qty) && i.qty >= 1 && i.qty <= 99
  );

  const products = await prisma.product.findMany({
    where: { slug: { in: wanted.map((i) => i.slug) }, isActive: true },
    include: { variants: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lines = wanted.map((item) => {
    const product = bySlug.get(item.slug);
    const variant = product?.variants.find((v) => v.size === item.size);
    if (!product || !variant) return { slug: item.slug, size: item.size, missing: true };

    const stock = variant.stock;
    return {
      slug: product.slug,
      size: item.size,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
      type: product.type,
      color: product.color,
      stock,
      qty: Math.min(item.qty, stock), // never more than we have
      wanted: item.qty,
    };
  });

  // The total is worked out here on the server from database prices.
  const subtotal = lines.reduce((sum, l) => sum + (l.missing ? 0 : l.price * l.qty), 0);
  return { lines, subtotal };
}
