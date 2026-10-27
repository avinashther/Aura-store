// Customer accounts (sign up, log in, sessions) are handled by Better Auth,
// a well-tested library. We don't write password code ourselves.
//
// What it does for us:
//  - hashes passwords with scrypt (the original password is never stored)
//  - keeps sessions in OUR database (session table) and sends only a random
//    token to the browser in an httpOnly cookie
//  - rate-limits login attempts in production
// Tables it uses: user, session, account, verification (see prisma/schema.prisma).

import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Phase 9 (emails) will turn on "verify your email before ordering".
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // stay logged in for 30 days
  },
  plugins: [nextCookies()], // lets server actions set the login cookie
});
