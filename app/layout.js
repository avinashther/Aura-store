import "./globals.css";

export const metadata = {
  title: "AURA – Clothing",
  description: "AURA. New season clothing.",
};

export const viewport = {
  viewportFit: "cover",
  themeColor: "#ecebe4",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
