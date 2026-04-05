import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hémé Kiitchen — Premium Jain-friendly Dips",
  description:
    "Handcrafted Jain-friendly dips with no onion, no garlic. Order online for pickup or home delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-parchment text-ink">
        {children}
      </body>
    </html>
  );
}
