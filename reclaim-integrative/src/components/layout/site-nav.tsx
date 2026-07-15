"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

const NAV_LINKS: { label: string; href: string; external?: boolean; sublinks?: { label: string; href: string }[] }[] = [
  { 
    label: "Services", 
    href: "/services",
    sublinks: [
      { label: "Our Services", href: "/services" },
      { label: "Conditions Treated", href: "/conditions-treated" }
    ]
  },
  { label: "Memberships", href: "/memberships" },
  { label: "About", href: "/about" },
  { label: "Press", href: "/press" },
  { label: "Journal", href: "/journal" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
];

export function SiteNav({ transparent = false }: { transparent?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!transparent) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  const isTransparent = transparent && !isScrolled && !isMenuOpen;

  return (
    <div className="fixed top-0 left-0 z-50 w-full transition-colors duration-300">
      <header
        className={`w-full h-[72px] px-6 md:px-10 grid grid-cols-[1fr_auto_1fr] items-center transition-colors duration-300 ${
          isTransparent ? "bg-transparent" : "bg-canvas/85 backdrop-blur-md border-b border-border"
        }`}
      >
        {/* Logo — always left */}
        <Link href="/" className={`font-serif text-xl transition-colors duration-300 ${isTransparent ? "text-white" : "text-ink"}`}>
          Reclaim
        </Link>

        {/* Nav links — always center */}
        <nav className={`hidden md:flex items-center justify-center gap-8 font-sans text-sm transition-colors duration-300 ${isTransparent ? "text-white" : "text-ink"}`}>
          {NAV_LINKS.map((link, index) => {
            const isActive = pathname === link.href || link.sublinks?.some(sub => pathname === sub.href);
            
            if (link.sublinks) {
              const isOpen = openDropdownIndex === index;
              return (
                <div 
                  key={link.label} 
                  className="relative group py-1"
                  onMouseEnter={() => setOpenDropdownIndex(index)}
                  onMouseLeave={() => setOpenDropdownIndex(null)}
                  onFocus={() => setOpenDropdownIndex(index)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setOpenDropdownIndex(null);
                    }
                  }}
                >
                  <Link 
                    href={link.href} 
                    className="relative flex items-center gap-1.5 pb-0.5"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                  >
                    <span className={`transition-colors duration-200 ${
                      isActive
                        ? (isTransparent ? "text-accent-gold" : "text-accent-sage")
                        : (isTransparent ? "text-white/80 hover:text-white" : "hover:text-accent-sage")
                    }`}>
                      {link.label}
                    </span>
                    <span
                      className={`absolute -bottom-0.5 left-0 h-[1.5px] transition-all duration-500 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"} ${isOpen ? "w-full" : ""} ${isTransparent ? "bg-accent-gold" : "bg-accent-sage"}`}
                    />
                  </Link>
                  {/* Dropdown Menu */}
                  <div 
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-6 transition-all duration-200 z-50 ${
                      isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="bg-white border border-border shadow-lg rounded-xl py-2 min-w-[200px] flex flex-col">
                      {link.sublinks.map(sublink => (
                        <Link 
                          key={sublink.href} 
                          href={sublink.href}
                          className={`px-4 py-2.5 transition-colors hover:bg-accent-sage/5 ${pathname === sublink.href ? "text-accent-sage font-medium" : "text-ink"}`}
                        >
                          {sublink.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="relative group py-1"
              >
                <span className={`transition-colors duration-200 ${
                  isActive
                    ? (isTransparent ? "text-accent-gold" : "text-accent-sage")
                    : (isTransparent ? "text-white/80 hover:text-white" : "hover:text-accent-sage")
                }`}>
                  {link.label}
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-[1.5px] transition-all duration-500 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"} ${isTransparent ? "bg-accent-gold" : "bg-accent-sage"}`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right side — CTA or spacer */}
        <div className="hidden md:flex justify-end">
          {!isTransparent && (
            <Button variant="primary" href="/book" className="text-sm">
              Book an Appointment
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className={`md:hidden col-start-3 transition-colors duration-300 ${isTransparent ? "text-white" : "text-ink"}`}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={28} weight="regular" /> : <List size={28} weight="regular" />}
        </button>
      </header>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden w-full bg-canvas/95 backdrop-blur-md border-b border-border px-6 py-6 flex flex-col gap-4 font-sans text-sm text-ink"
        >
          {NAV_LINKS.map((link) => {
            if (link.sublinks) {
              return (
                <div key={link.label} className="flex flex-col gap-3 py-1">
                  <span className="text-muted text-xs uppercase tracking-widest font-medium font-serif">{link.label}</span>
                  <div className="flex flex-col gap-3 pl-4 border-l border-border/60">
                    {link.sublinks.map(sublink => {
                      const isSubActive = pathname === sublink.href;
                      return (
                        <Link
                          key={sublink.href}
                          href={sublink.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`transition-colors duration-200 hover:text-accent-sage ${
                            isSubActive ? "text-accent-sage font-medium" : ""
                          }`}
                        >
                          {sublink.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setIsMenuOpen(false)}
                className={`transition-colors duration-200 hover:text-accent-sage py-1 ${
                  isActive ? "text-accent-sage font-medium" : ""
                }`}
              >  {link.label}
              </Link>
            );
          })}
          <Button
            variant="primary"
            href="/book"
            className="text-sm w-full"
            onClick={() => setIsMenuOpen(false)}
          >
            Book an Appointment
          </Button>
        </motion.nav>
      )}
    </div>
  );
}
