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
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
