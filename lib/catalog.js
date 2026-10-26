// Every question the website asks the database about products lives here.
// Pages call these functions and never talk to Prisma directly.

import { cacheLife } from "next/cache";
import { prisma } from "@/lib/prisma";

// The database stores sizes as rows (Variant). The pages expect an object like
// { S: 6, M: 8, L: 4, XL: 0 }, so this turns one into the other.
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const bySize = (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size);

function toProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    type: row.type,
    color: row.color,
    isNew: row.isNew,
    details: row.details,
    sizes: Object.fromEntries([...row.variants].sort(bySize).map((v) => [v.size, v.stock])),
  };
}

const withSizes = { variants: true };

// "use cache" = remember the answer for a while, so we don't ask Neon on every
// single page view. cacheLife("minutes") refreshes it every few minutes.
// (When the admin panel edits a product later, we will clear this cache.)

// All products, optionally filtered by category / "new", and sorted.
export async function getProducts({ category, onlyNew = false, sort = "new", limit } = {}) {
  "use cache";
  cacheLife("minutes");

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : { id: "desc" }; // newest first

  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      ...(onlyNew ? { isNew: true } : {}),
    },
    orderBy,
    take: limit,
    include: withSizes,
  });
  return rows.map(toProduct);
}

// One product by its slug, or null if it doesn't exist.
export async function getProduct(slug) {
  "use cache";
  cacheLife("minutes");

  const row = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: withSizes,
  });
  return row ? toProduct(row) : null;
}

// Other products in the same category (for "More tops").
export async function getRelated(category, excludeSlug, limit = 4) {
  "use cache";
  cacheLife("minutes");

  const rows = await prisma.product.findMany({
    where: { isActive: true, category, NOT: { slug: excludeSlug } },
    orderBy: { id: "desc" },
    take: limit,
    include: withSizes,
  });
  return rows.map(toProduct);
}

// { tops: 3, bottoms: 2, outerwear: 2 }, used on the home page category tiles.
export async function getCategoryCounts() {
  "use cache";
  cacheLife("minutes");

  const groups = await prisma.product.groupBy({
    by: ["category"],
    where: { isActive: true },
    _count: { _all: true },
  });
  return Object.fromEntries(groups.map((g) => [g.category, g._count._all]));
}

// Every slug, so Next.js can build all product pages ahead of time.
export async function getAllSlugs() {
  "use cache";
  cacheLife("minutes");

  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
