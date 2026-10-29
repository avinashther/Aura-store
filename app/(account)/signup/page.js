import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { safeNext } from "@/lib/redirects";
import { signup } from "../actions";
import styles from "../account.module.css";

export const metadata = { title: "Create account – AURA" };

export default async function SignupPage({ searchParams }) {
  if (await getUser()) redirect(safeNext((await searchParams).next));
  const { error, next: nextParam } = await searchParams;
  const next = safeNext(nextParam);

  return (
    <div className={styles.page}>
      <h1>Create account</h1>
      <form action={signup} className={styles.form}>
        <input type="hidden" name="next" value={next} />
        <label>
          Name
          <input name="name" required maxLength={80} autoComplete="name" autoFocus />
        </label>
        <label>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          Password (8+ characters)
          <input type="password" name="password" required minLength={8} maxLength={128} autoComplete="new-password" />
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" className={styles.primary}>Create account</button>
      </form>
      <p className={styles.alt}>
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}><u>Log in</u></Link>
      </p>
    </div>
  );
}
