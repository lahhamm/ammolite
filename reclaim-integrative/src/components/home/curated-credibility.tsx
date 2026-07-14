import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const STATS = [
  { value: "3B+", label: "Media impressions" },
  { value: "11+", label: "Press features" },
  { value: "7", label: "Podcast appearances" },
  { value: "117M+", label: "Monthly readers reached" },
];

export function CuratedCredibility() {
  return (
    <ScrollReveal>
      <section className="py-24 px-6 md:px-10 bg-canvas">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border rounded-lg p-8">
              <p className="font-serif text-sm text-muted mb-2">GQ</p>
              <h3 className="font-serif text-2xl leading-snug">
                Does magnesium spray actually help ease stress and improve sleep?
              </h3>
            </div>
            <div className="border border-border rounded-lg p-8">
              <p className="font-serif text-sm text-muted mb-2">Marie Claire</p>
              <h3 className="font-serif text-2xl leading-snug">
                The surprising benefits of hydrotherapy for circulation and recovery.
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl text-accent-sage">{stat.value}</p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/press" className="font-sans text-sm underline underline-offset-4 text-ink">
              View all press features
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
