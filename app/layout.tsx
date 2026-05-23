import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import CookieBanner from "@/components/CookieBanner";
import PageTransition from "@/components/PageTransition";
import { CartProvider } from "@/lib/cartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UsmanHub – Buy & Sell Anything",
  description: "Find great deals on new and used items near you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f0f4ff] text-gray-900 overflow-x-hidden" suppressHydrationWarning>
        <CartProvider>
          <Navbar />
          <main className="flex-1 pb-20 lg:pb-0">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <BottomNav />
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
