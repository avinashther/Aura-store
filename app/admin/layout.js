import { Suspense } from "react";

// Keep Google away from the admin pages.
export const metadata = {
  title: "Admin – AURA",
  robots: { index: false, follow: false },
};

// Admin pages read the login cookie, so they are built fresh for every visit.
// Next.js wants that kind of page inside <Suspense>.
export default function AdminLayout({ children }) {
  return <Suspense fallback={<p style={{ padding: 40 }}>Loading…</p>}>{children}</Suspense>;
}
