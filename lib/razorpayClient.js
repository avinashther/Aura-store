"use client";

// Opens Razorpay's payment window in the browser.

let loading = null;
function loadScript() {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = () => {
      loading = null;
      reject(new Error("Could not load the payment window. Check your internet and try again."));
    };
    document.head.appendChild(s);
  });
  return loading;
}

// `pay` comes from our server: { keyId, razorpayOrderId, amount, name, email, phone }.
// Resolves { paid: true, response } or { paid: false } if the shopper closed the window.
export async function payWithRazorpay(pay) {
  await loadScript();
  return new Promise((resolve) => {
    const rzp = new window.Razorpay({
      key: pay.keyId,
      order_id: pay.razorpayOrderId,
      amount: pay.amount,
      currency: "INR",
      name: "AURA",
      description: "Your AURA order",
      prefill: { name: pay.name, email: pay.email, contact: pay.phone },
      theme: { color: "#3c572b" },
      handler: (response) => resolve({ paid: true, response }),
      modal: { ondismiss: () => resolve({ paid: false }) },
    });
    rzp.open();
  });
}
