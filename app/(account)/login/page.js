import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { login } from "../actions";
import styles from "../account.module.css";

export const metadata = { title: "Log in – AURA" };

export default async function LoginPage({ searchParams }) {
  if (await getUser()) redirect("/account");
  const { error } = await searchParams;

  return (
    <div className={styles.page}>
      <h1>Log in</h1>
      <form action={login} className={styles.form}>
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" autoFocus />
        </label>
        <label>
          Password
          <input type="password" name="password" required autoComplete="current-password" />
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" className={styles.primary}>Log in</button>
      </form>
      <p className={styles.alt}>
        New to AURA? <Link href="/signup"><u>Create an account</u></Link>
      </p>
    </div>
  );
}
