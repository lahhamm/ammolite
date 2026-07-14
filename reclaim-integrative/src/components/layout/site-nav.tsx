import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteNav({ transparent = false }: { transparent?: boolean }) {
  return (
    <header
      className={`w-full h-[72px] flex items-center justify-between px-6 md:px-10 ${
        transparent ? "absolute top-0 left-0 z-10 bg-transparent" : "bg-canvas border-b border-border"
      }`}
    >
      <Link href="/" className="font-serif text-xl text-ink">
        Reclaim
      </Link>
      <nav className="hidden md:flex items-center gap-8 font-sans text-sm text-ink">
        <Link href="/services">Services</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      {!transparent && (
        <Button variant="primary" className="text-sm">
          Schedule Consultation
        </Button>
      )}
    </header>
  );
}
