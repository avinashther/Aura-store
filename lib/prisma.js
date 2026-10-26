// One shared database connection for the whole website.
// Any page can do:  import { prisma } from "@/lib/prisma";
// then:             await prisma.product.findMany()

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// In development Next.js reloads files often. Keeping the client on `globalThis`
// stops it from opening a new database connection on every reload.
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
