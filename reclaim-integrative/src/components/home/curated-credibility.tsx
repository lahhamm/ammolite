import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import * as motion from "motion/react-client";

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
    <section className="py-24 px-6 md:px-10 bg-canvas">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((item, idx) => (
            <ScrollReveal key={item.outlet} delay={idx * 0.2}>
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                <motion.div
                  className="border border-border p-8 hover:bg-accent-sage/5 transition-colors duration-300 cursor-pointer h-full"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <p className="font-serif text-sm text-muted mb-2">{item.outlet}</p>
                  <h3 className="font-serif text-2xl leading-snug hover:text-accent-sage transition-colors">
                    {item.topic}
                  </h3>
                </motion.div>
              </a>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4}>
          <div className="text-center mt-10">
            <Link href="/press" className="font-sans text-sm underline underline-offset-4 text-ink hover:text-accent-sage transition-colors">
              View all press features
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
