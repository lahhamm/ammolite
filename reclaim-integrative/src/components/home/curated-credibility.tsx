import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const FEATURES = [
  {
    outlet: "Good Housekeeping",
    topic: "Expert commentary on supplements and liver health",
    href: "https://www.goodhousekeeping.com",
  },
  {
    outlet: "Marie Claire",
    topic: "Featured practice profile on integrative wellness",
    href: "https://www.marieclaire.com",
  },
];

export function CuratedCredibility() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10 bg-canvas">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 md:mb-16 gap-6">
            <h2 className="font-serif text-3xl md:text-5xl text-ink max-w-xl leading-tight">
              Recognized in leading health and wellness publications.
            </h2>
            <Link
              href="/press"
              className="group inline-flex items-center gap-2 py-2 text-sm font-sans font-medium tracking-wide uppercase text-ink hover:text-accent-sage transition-colors duration-300"
            >
              View all press
              <ArrowRight size={16} aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {FEATURES.map((item, idx) => (
            <ScrollReveal key={item.outlet} delay={idx * 0.1}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col justify-between gap-8 rounded-2xl border border-border bg-white p-6 md:p-8 transition-colors duration-300 hover:border-accent-sage"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-muted">
                    {item.outlet}
                  </p>
                  <ArrowUpRight
                    size={20}
                    aria-hidden="true"
                    className="shrink-0 text-muted transition-colors duration-300 group-hover:text-accent-sage"
                  />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-ink leading-snug">
                  {item.topic}
                </h3>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
