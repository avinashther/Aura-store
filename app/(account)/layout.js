import { Suspense } from "react";

export const metadata = { robots: { index: false, follow: false } };

// These pages check who is logged in, so they are built fresh for every visit.
// Next.js wants that kind of page inside <Suspense>.
export default function AccountLayout({ children }) {
  return <Suspense fallback={<p style={{ padding: 40 }}>Loading…</p>}>{children}</Suspense>;
}
