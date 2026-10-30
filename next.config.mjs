/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,

  // Only affects "npm run dev". Lets you open the site on your PHONE while it runs on your
  // laptop (same Wi-Fi or hotspot): use the "Network" address that `npm run dev` prints.
  // Without this, the page loads on the phone but the buttons do nothing.
  // These are the address ranges home networks and phone hotspots use.
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    "*.trycloudflare.com", // temporary tunnels (see the README)
    "*.loca.lt",
  ],
};

export default nextConfig;
