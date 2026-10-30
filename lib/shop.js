// The seller's WhatsApp number. Not secret (it is shown to every visitor). Set it in .env:
//
//   NEXT_PUBLIC_WHATSAPP_NUMBER="919876543210"
//
// Country code first, no + or spaces. A plain 10-digit number is treated as an Indian number.

const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

export const WHATSAPP_NUMBER = digits.length === 10 ? `91${digits}` : digits;
