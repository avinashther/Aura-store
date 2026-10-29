// "Who is logged in right now?" helpers for pages and server actions.

import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Returns the logged-in customer, or null.
export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

// Put this at the top of any page or action that needs a logged-in customer.
// Pass where to come back to after logging in, e.g. requireUser("/checkout").
export async function requireUser(next) {
  const user = await getUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}
