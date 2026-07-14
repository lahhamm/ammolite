import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Philosophy() {
  return (
    <ScrollReveal>
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl leading-snug">
            Naturopathic medicine for whole-body wellness.
          </h2>
          <p className="mt-6 text-muted leading-relaxed">
            We look for the root cause, not just the symptom. Every new patient
            gets 60 minutes with a licensed naturopathic doctor, comprehensive
            labs, and a plan built around hormones, gut health, thyroid, and
            long-term energy, coordinated across every visit.
          </p>
        </div>
      </section>
    </ScrollReveal>
  );
}
