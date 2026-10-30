import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata = {
  title: "AURA – Clothing",
  description: "AURA. New season clothing.",
};

export const viewport = {
  viewportFit: "cover",
  themeColor: "#ecebe4",
};

// The layout wraps EVERY page: header on top, footer at the bottom,
// and the current page ({children}) in the middle.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
