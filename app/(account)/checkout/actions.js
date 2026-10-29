"use server";

// Places an order. This is the most important function in the shop, so it trusts
// NOTHING from the browser: it checks the address, re-reads every price and the stock
// from the database, and does it all in ONE database transaction:
//   either everything happens (stock reduced + order saved) or nothing does.

import { updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/session";
import { INDIAN_STATES, shippingFor } from "@/lib/orders";

// An error we WANT to show the shopper (as opposed to a bug).
class OrderError extends Error {}

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max + 1) : "");

function checkAddress(a) {
  if (!a || typeof a !== "object") throw new OrderError("Please fill in your delivery address.");

  const name = clean(a.name, 80);
  const line1 = clean(a.line1, 120);
  const line2 = clean(a.line2, 120);
  const city = clean(a.city, 60);
  const state = clean(a.state, 60);
  const pincode = clean(a.pincode, 6).replace(/\s/g, "");
  // Accept "98765 43210", "+91 98765 43210", "098765-43210" and keep just the 10 digits.
  const phone = clean(a.phone, 20).replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");

  if (name.length < 2 || name.length > 80) throw new OrderError("Please enter your full name.");
  if (!/^[6-9]\d{9}$/.test(phone)) throw new OrderError("Please enter a valid 10-digit mobile number.");
  if (line1.length < 3 || line1.length > 120) throw new OrderError("Please enter your address (house number, street).");
  if (line2.length > 120) throw new OrderError("Address line 2 is too long.");
  if (city.length < 2 || city.length > 60) throw new OrderError("Please enter your city.");
  if (!INDIAN_STATES.includes(state)) throw new OrderError("Please choose your state.");
  if (!/^[1-9]\d{5}$/.test(pincode)) throw new OrderError("Please enter a valid 6-digit pincode.");

  return { name, phone, line1, line2: line2 || null, city, state, pincode };
}

// Same-product-same-size lines are merged, and anything odd is thrown out.
function checkItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw new OrderError("Your bag is empty.");
  }
  const merged = new Map();
  for (const i of items) {
    if (
      !i ||
      typeof i.slug !== "string" || i.slug.length > 100 ||
      typeof i.size !== "string" || i.size.length > 10 ||
      !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 99
    ) {
      throw new OrderError("Something is wrong with your bag. Please review it.");
    }
    const key = `${i.slug}|${i.size}`;
    const qty = (merged.get(key)?.qty ?? 0) + i.qty;
    if (qty > 99) throw new OrderError("That is too many of one item.");
    merged.set(key, { slug: i.slug, size: i.size, qty });
  }
  return [...merged.values()];
}

export async function placeOrder(items, address) {
  try {
    const user = await getUser();
    if (!user) return { ok: false, login: true, error: "Please log in to place your order." };

    const ship = checkAddress(address);
    const lines = checkItems(items);

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { slug: { in: lines.map((l) => l.slug) }, isActive: true },
        include: { variants: true },
      });
      const bySlug = new Map(products.map((p) => [p.slug, p]));

      let subtotal = 0;
      const orderItems = [];

      for (const line of lines) {
        const product = bySlug.get(line.slug);
        const variant = product?.variants.find((v) => v.size === line.size);
        if (!product || !variant) {
          throw new OrderError("An item in your bag is no longer available. Please review your bag.");
        }

        // "Take N off the stock, but ONLY IF at least N are left", as one step.
        // If two shoppers grab the last piece at the same moment, the database lets
        // only one of them through, so we can never sell something we don't have.
        const taken = await tx.variant.updateMany({
          where: { id: variant.id, stock: { gte: line.qty } },
          data: { stock: { decrement: line.qty } },
        });
        if (taken.count === 0) {
          const left = (
            await tx.variant.findUnique({ where: { id: variant.id }, select: { stock: true } })
          )?.stock ?? 0;
          throw new OrderError(
            left === 0
              ? `Sorry, ${product.name} (size ${line.size}) just sold out. Please review your bag.`
              : `Sorry, only ${left} left of ${product.name} (size ${line.size}). Please review your bag.`
          );
        }

        subtotal += product.price * line.qty; // price comes from the database, never the browser
        orderItems.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          size: line.size,
          qty: line.qty,
          price: product.price,
          image: product.images[0] ?? null,
        });
      }

      const shippingFee = shippingFor(subtotal);
      return tx.order.create({
        data: {
          userId: user.id,
          paymentMethod: "cod",
          subtotal,
          shippingFee,
          total: subtotal + shippingFee,
          shipName: ship.name,
          shipPhone: ship.phone,
          shipLine1: ship.line1,
          shipLine2: ship.line2,
          shipCity: ship.city,
          shipState: ship.state,
          shipPincode: ship.pincode,
          items: { create: orderItems },
        },
        select: { id: true },
      });
    });

    updateTag("products"); // stock changed, so refresh the shop pages
    return { ok: true, id: order.id };
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message };
    console.error("placeOrder failed:", e);
    return { ok: false, error: "Something went wrong. Your order was not placed. Please try again." };
  }
}
