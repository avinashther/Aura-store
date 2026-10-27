import { requireUser } from "@/lib/session";
import { logout } from "../actions";
import styles from "../account.module.css";

export const metadata = { title: "Your account – AURA" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className={styles.page}>
      <h1>Hi, {user.name}</h1>
      <p className={styles.muted}>{user.email}</p>

      <section className={styles.box}>
        <h2>Your orders</h2>
        <p>No orders yet. They will show up here once checkout is ready.</p>
      </section>

      <form action={logout}>
        <button type="submit" className={styles.ghost}>Log out</button>
      </form>
    </div>
  );
}
