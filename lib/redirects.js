// After logging in, send the shopper back to where they were going, but ONLY to
// pages on this list. Never redirect to an address taken from the URL as it is,
// or a scammer could make our login page send people to a fake site.
const ALLOWED = ["/checkout"];

export const safeNext = (value) => (ALLOWED.includes(value) ? value : "/account");
