import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Philosophy() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-2xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl leading-tight">
            Naturopathic medicine for whole-body wellness.
          </h2>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <p className="mt-6 text-muted leading-relaxed">
            We look for the root cause, not just the symptom. By combining 
            advanced diagnostics with integrative therapies, we treat the whole 
            person rather than just managing illness. Our methodology spans hormone 
            optimization, gut health, and cellular longevity to help you truly 
            reclaim your vitality.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
