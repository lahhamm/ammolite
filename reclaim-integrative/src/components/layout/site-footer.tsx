import Link from "next/link";
import { Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

const SECONDARY_LINKS = [
  { label: "Memberships", href: "/memberships" },
  { label: "Shop", href: "/shop" },
  { label: "Conditions Treated", href: "/conditions-treated" },
  { label: "What to Expect", href: "/what-to-expect" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-canvas px-6 md:px-10 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-serif text-lg mb-3">Reclaim Integrative Medicine</p>
          <p className="text-sm text-canvas/70">
            1100 Quail Street, Suite 117
            <br />
            Newport Beach, CA 92660
          </p>
          <p className="text-sm text-canvas/70 mt-3">
            10470 Foothill Blvd Suite 220
            <br />
            Rancho Cucamonga, CA 91730
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {SECONDARY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-canvas/80 hover:text-canvas">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-canvas/70 flex flex-col gap-2">
          <p className="flex items-center gap-2">
            <Phone size={16} weight="regular" aria-label="Phone" />
            (949) 423-3522
          </p>
          <p className="flex items-center gap-2">
            <EnvelopeSimple size={16} weight="regular" aria-label="Email" />
            reception@reclaimintegrative.com
          </p>
        </div>
      </div>
    </footer>
  );
}
