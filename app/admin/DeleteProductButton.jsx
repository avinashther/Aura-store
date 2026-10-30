"use client";

import { deleteProduct } from "./actions";

// A "Delete" button that asks "are you sure?" first. A client component because the
// question is a browser pop-up. The real work (and the admin check) happens on the server.
export default function DeleteProductButton({ id, name, className, children = "Delete" }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        const ok = window.confirm(
          `Delete "${name}" for good?\n\nIt disappears from the shop and cannot be brought back. ` +
            `(To hide it for a while instead, untick "Visible in the shop" when editing.)`
        );
        if (!ok) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>{children}</button>
    </form>
  );
}
