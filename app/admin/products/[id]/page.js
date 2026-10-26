import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
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
    </div>
  );
}
