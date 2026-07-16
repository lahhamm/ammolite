import type { Metadata } from "next";
import { Lora, Work_Sans } from "next/font/google";
import "./globals.css";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { ChatWidget } from "@/components/chat/chat-widget";

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
  metadataBase: new URL('https://reclaimintegrative.com'),
  title: {
    default: "Reclaim Integrative Medicine | Naturopathic Doctor Newport Beach",
    template: "%s | Reclaim Integrative Medicine",
  },
  description:
    "Personalized naturopathic and integrative medicine in Newport Beach and Rancho Cucamonga. Hormone optimization, IV therapy, and root-cause care.",
  openGraph: {
    title: "Reclaim Integrative Medicine | Naturopathic Doctor Newport Beach",
    description: "Personalized naturopathic and integrative medicine in Newport Beach and Rancho Cucamonga. Hormone optimization, IV therapy, and root-cause care.",
    url: 'https://reclaimintegrative.com',
    siteName: 'Reclaim Integrative Medicine',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Reclaim Integrative Medicine | Naturopathic Doctor Newport Beach",
    description: "Personalized naturopathic and integrative medicine in Newport Beach and Rancho Cucamonga.",
  },
  alternates: {
    canonical: '/',
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lora.variable} ${workSans.variable}`}>
      <body className="font-sans">
        {children}
        <MobileStickyCta />
        <ChatWidget />
      </body>
    </html>
  );
}
