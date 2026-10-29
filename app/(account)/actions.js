"use server";

// Server actions for the sign up / log in / log out forms.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { safeNext } from "@/lib/redirects";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (formData, key) => String(formData.get(key) ?? "").trim();

export async function signup(formData) {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? ""); // never trim passwords

  let error = null;
  if (!name || name.length > 80) error = "Please enter your name.";
  else if (!EMAIL.test(email) || email.length > 254) error = "Please enter a valid email.";
  else if (password.length < 8) error = "Password must be at least 8 characters.";
  else if (password.length > 128) error = "Password is too long (max 128 characters).";

  if (!error) {
    try {
      await auth.api.signUpEmail({ body: { name, email, password } });
    } catch (e) {
      if (!(e instanceof APIError)) throw e;
      error = /exist/i.test(`${e.body?.code} ${e.body?.message}`)
        ? "An account with this email already exists. Try logging in."
        : "Could not create your account. Please try again.";
    }
  }
  const next = safeNext(text(formData, "next"));
  if (error) redirect(`/signup?error=${encodeURIComponent(error)}&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function login(formData) {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  let error = null;
  try {
    await auth.api.signInEmail({ body: { email, password } });
  } catch (e) {
    if (!(e instanceof APIError)) throw e;
    // Same message whether the email or the password was wrong, so nobody can
    // use this form to find out which emails have accounts.
    error = e.statusCode === 429 ? "Too many attempts. Please wait a minute." : "Wrong email or password.";
  }
  const next = safeNext(text(formData, "next"));
  if (error) redirect(`/login?error=${encodeURIComponent(error)}&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
