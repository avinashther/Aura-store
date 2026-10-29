// Order rules shared by the checkout page (browser) and the server.
// Nothing secret in here, so it is safe to import from anywhere.

// Shipping: free for bigger bags, a flat fee otherwise. Change the numbers here.
export const FREE_SHIPPING_OVER = 1999;
export const SHIPPING_FEE = 99;
export const shippingFor = (subtotal) => (subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE);

// "AURA-1007" is friendlier to read out on the phone than a bare 7.
export const orderNumber = (id) => `AURA-${1000 + id}`;

export const STATUS_LABELS = {
  placed: "Order placed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS = { cod: "Pay on delivery" };

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
];

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});
export const formatDate = (d) => dateFmt.format(d);
