import { requireAdmin } from "@/lib/adminAuth";
import ProductForm from "../../ProductForm";
import styles from "../../admin.module.css";

export default async function NewProductPage({ searchParams }) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className={styles.narrow}>
      <h1>Add product</h1>
      <ProductForm error={error} />
    </div>
  );
}
