// Two shop settings, both set in .env. Neither is secret (the number is shown to everyone).
//
//  NEXT_PUBLIC_WHATSAPP_NUMBER   the seller's WhatsApp number, e.g. 919876543210
//                                (country code first, no + or spaces. A plain 10-digit
//                                number is treated as an Indian number.)
//  NEXT_PUBLIC_ONLINE_CHECKOUT   "true" turns on accounts + online payment (Razorpay).
//                                Anything else = customers order by chatting on WhatsApp.

const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

export const WHATSAPP_NUMBER = digits.length === 10 ? `91${digits}` : digits;

export const ONLINE_CHECKOUT = process.env.NEXT_PUBLIC_ONLINE_CHECKOUT === "true";
