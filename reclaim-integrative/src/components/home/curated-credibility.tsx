import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight } from "lucide-react";

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
    <section className="py-32 px-6 md:px-10 bg-canvas relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-sage/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <h2 className="font-serif text-4xl md:text-5xl text-ink max-w-xl leading-tight">
              Recognized in leading health and wellness publications.
            </h2>
            <Link 
              href="/press" 
              className="group flex items-center gap-2 text-sm font-sans font-medium tracking-wide uppercase text-ink hover:text-accent-sage transition-colors duration-300 pb-2 border-b border-ink/20 hover:border-accent-sage"
            >
              View all press
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {FEATURES.map((item, idx) => (
            <ScrollReveal key={item.outlet} delay={idx * 0.2}>
              <a 
                href={item.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block h-full"
              >
                <div className="h-full flex flex-col justify-between p-10 md:p-14 bg-white/40 backdrop-blur-md border border-ink/5 rounded-3xl hover:border-accent-sage/20 hover:bg-white hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  <div className="flex justify-between items-start mb-24">
                    <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-muted">
                      {item.outlet}
                    </p>
                    <div className="w-12 h-12 rounded-full bg-canvas border border-ink/10 flex items-center justify-center group-hover:bg-accent-sage group-hover:border-accent-sage group-hover:text-white transition-all duration-500 ease-out shadow-sm">
                      <ArrowRight className="w-5 h-5 transform -rotate-45 group-hover:rotate-0 transition-transform duration-500 ease-out" />
                    </div>
                  </div>
                  <h3 className="font-serif text-3xl md:text-4xl text-ink leading-snug group-hover:text-accent-sage transition-colors duration-500">
                    {item.topic}
                  </h3>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
