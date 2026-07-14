import type { Metadata } from "next";
import { Lora, Work_Sans } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reclaim Integrative Medicine | Naturopathic Doctor Newport Beach",
  description:
    "Personalized naturopathic and integrative medicine in Newport Beach and Rancho Cucamonga. Hormone optimization, IV therapy, and root-cause care.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lora.variable} ${workSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
