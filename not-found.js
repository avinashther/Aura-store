import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeContent: "center", gap: 12, textAlign: "center", padding: "0 var(--page-pad)" }}>
      <h1>Page not found</h1>
      <p>That page doesn&rsquo;t exist, or the product has been removed.</p>
      <p><Link href="/shop"><u>Back to the shop</u></Link></p>
    </div>
  );
}
