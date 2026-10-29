import { requireUser } from "@/lib/session";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata = { title: "Checkout – AURA" };

export default async function CheckoutPage() {
  // Not logged in? Go to login, then come straight back here. The bag is kept in the
  // browser, so it is still there.
  const user = await requireUser("/checkout");
  return <CheckoutForm defaultName={user.name} />;
}
