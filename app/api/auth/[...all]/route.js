// Better Auth's own web address (/api/auth/...). Our forms use server actions,
// but this route is needed for things like "Log in with Google" later.
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
