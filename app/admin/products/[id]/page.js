import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import DeleteProductButton from "../../DeleteProductButton";
import ProductForm from "../../ProductForm";
import styles from "../../admin.module.css";

export default async function EditProductPage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) notFound();

  return (
    <div className={styles.narrow}>
      <h1>Edit: {product.name}</h1>
      <ProductForm product={product} error={error} />

      <section className={styles.dangerZone}>
        <h2>Delete this product</h2>
        <p>
          This removes it from the shop for good. To hide it for a while instead, untick
          &ldquo;Visible in the shop&rdquo; above and save.
        </p>
        <DeleteProductButton id={product.id} name={product.name} className={styles.dangerBtn}>
          Delete product
        </DeleteProductButton>
      </section>
    </div>
  );
}
