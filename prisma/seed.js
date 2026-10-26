// Loads the fake products from lib/products.js into the real database.
// Run it with:  npm run db:seed
// It is safe to run again: products are matched by slug, so nothing is duplicated.

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PRODUCTS } from "../lib/products.js";

// The adapter is the "cable" between Prisma and your Neon database.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const p of PRODUCTS) {
    // 1. Create the product row, or update it if the slug already exists.
    const data = {
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      type: p.type,
      color: p.color,
      isNew: p.isNew ?? false,
      details: p.details,
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });

    // 2. Replace its size rows. { S: 6, M: 8 } becomes one row per size.
    await prisma.variant.deleteMany({ where: { productId: product.id } });
    await prisma.variant.createMany({
      data: Object.entries(p.sizes).map(([size, stock]) => ({
        productId: product.id,
        size,
        stock,
      })),
    });

    console.log(`Saved ${p.name} (${Object.keys(p.sizes).length} sizes)`);
  }
}

main()
  .then(() => console.log("Done."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
