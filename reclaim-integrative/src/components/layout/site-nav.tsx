"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function SiteNav({ transparent = false }: { transparent?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={transparent ? "absolute top-0 left-0 z-10 w-full" : "relative w-full"}>
      <header
        className={`w-full h-[72px] flex items-center justify-between px-6 md:px-10 ${
          transparent ? "bg-transparent" : "bg-canvas border-b border-border"
        }`}
      >
        <Link href="/" className="font-serif text-xl text-ink">
          Reclaim
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-sans text-sm text-ink">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        {!transparent && (
          <Button variant="primary" className="hidden md:inline-flex text-sm">
            Schedule Consultation
          </Button>
        )}
        <button
          type="button"
          className="md:hidden text-ink"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={28} weight="regular" /> : <List size={28} weight="regular" />}
        </button>
      </header>
      {isMenuOpen && (
        <nav className="md:hidden w-full bg-canvas border-b border-border px-6 py-6 flex flex-col gap-4 font-sans text-sm text-ink">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!transparent && (
            <Button variant="primary" className="text-sm w-full" onClick={() => setIsMenuOpen(false)}>
              Schedule Consultation
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
