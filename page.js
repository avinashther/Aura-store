import Header from "@/components/Header";
import Hero from "@/components/Hero";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        {/* Placeholder so the "Shop new arrivals" button has somewhere to scroll.
            Phase 2 replaces this with the real product grid. */}
        <section id="new-arrivals" className={styles.next}>
          <h2>New arrivals</h2>
          <p>Phase 2 starts here.</p>
        </section>
      </main>
    </>
  );
}
