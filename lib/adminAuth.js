// Simple admin login for Phase 4: one shared password, kept in .env.
// (Phase 5 replaces this with real accounts: sign-up, login, roles.)
//
// How it works:
//  1. The owner types the password on /admin/login.
//  2. If it is right, we put a signed "ticket" in an httpOnly cookie.
//     httpOnly = JavaScript in the browser can't read it, which is safer.
//  3. Every admin page AND every admin action checks the ticket again.
//     (Hiding a button is not security. The server must check every time.)

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "aura_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // stay logged in for 8 hours

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("Add SESSION_SECRET to .env (any random text, at least 16 characters).");
  }
  return s;
}

// The "signature" proves the ticket was made by our server, not by someone typing a cookie.
const sign = (expires) =>
  createHmac("sha256", secret()).update(`admin.${expires}`).digest("hex");

// Compare two strings in a way that doesn't leak how many letters matched.
function safeEqual(a, b) {
  const x = createHash("sha256").update(String(a)).digest();
  const y = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(x, y);
}

export function passwordIsRight(input) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || real.length < 8) {
    throw new Error("Add ADMIN_PASSWORD to .env (at least 8 characters).");
  }
  return safeEqual(input ?? "", real);
}

export async function startSession() {
  await connection();
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // https only once deployed
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  // "This answer is different for every visitor", so Next.js must not pre-build it.
  await connection();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

// Put this at the top of every admin page and every admin action.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
