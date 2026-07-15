import Link from "next/link";
import { Phone, Printer, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

const SECONDARY_LINKS = [
  { label: "Memberships", href: "/memberships" },
  { label: "Journal", href: "/journal" },
  { label: "Shop", href: "/shop" },
  { label: "Conditions Treated", href: "/conditions-treated" },
  { label: "FAQs", href: "/faqs" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-canvas px-6 md:px-10 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="border-b border-canvas/15 pb-12 mb-12 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <p className="font-serif text-2xl md:text-3xl mb-2">Book your appointment online</p>
            <p className="text-sm text-canvas/70">
              The fastest way to schedule at either clinic. Prefer to call? Reach us at{" "}
              <a href="tel:+19494233522" className="underline underline-offset-4 hover:text-canvas">
                (949) 423-3522
              </a>
              .
            </p>
          </div>
          <Button variant="inverse" href="/book" className="shrink-0">
            Book an Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="font-serif text-lg mb-3">Reclaim Integrative Medicine</p>
            <p className="text-sm text-canvas/70">
              1100 Quail Street, Suite 117
              <br />
              Newport Beach, CA 92660
              <br />
              <span className="text-canvas/50">(inside Juvemed)</span>
            </p>
            <p className="text-sm text-canvas/70 mt-3">
              10470 Foothill Blvd Suite 220
              <br />
              Rancho Cucamonga, CA 91730
              <br />
              <span className="text-canvas/50">(inside Khloestika)</span>
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
              <a href="tel:+19494233522" className="hover:text-canvas">
                (949) 423-3522
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Printer size={16} weight="regular" aria-label="Fax" />
              <span>Fax: (949) 629-6929</span>
            </p>
            <p className="flex items-center gap-2">
              <EnvelopeSimple size={16} weight="regular" aria-label="Email" />
              <a href="mailto:reception@reclaimintegrative.com" className="hover:text-canvas">
                reception@reclaimintegrative.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
