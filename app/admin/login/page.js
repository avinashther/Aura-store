import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import { login } from "../actions";
import styles from "../admin.module.css";

export default async function LoginPage({ searchParams }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className={styles.narrow}>
      <h1>Admin login</h1>
      <form action={login} className={styles.form}>
        <label>
          Password
          <input type="password" name="password" required autoComplete="current-password" autoFocus />
        </label>
        {error && <p className={styles.error} role="alert">Wrong password.</p>}
        <button type="submit" className={styles.primary}>Log in</button>
      </form>
    </div>
  );
}
