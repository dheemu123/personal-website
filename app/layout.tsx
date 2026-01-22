import type { Metadata } from "next";
import { Bodoni_Moda, Didact_Gothic } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
});

const didact = Didact_Gothic({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-didact",
});

export const metadata: Metadata = {
  title: "Dheemanth Munipalli",
  description: "Personal website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodoni.variable} ${didact.variable}`}>
      <body className="font-didact">{children}</body>
    </html>
  );
}
