import { ScrollReveal } from "@/components/ui/scroll-reveal";

const TESTIMONIALS = [
  {
    quote:
      "After years of being told my labs were normal, Dr. Colon found the root cause. Three months in, I felt like a new person.",
    name: "Rachel M.",
    city: "Newport Beach, CA",
  },
  {
    quote:
      "The comprehensive labs were unlike anything my PCP ever ordered. I have my energy back.",
    name: "James T.",
    city: "Irvine, CA",
  },
  {
    quote:
      "I drove from Laguna Beach because a friend raved about the peptide therapy. Worth every mile.",
    name: "Karen S.",
    city: "Laguna Beach, CA",
  },
];

export function Testimonials() {
  return (
    <ScrollReveal>
      <section className="py-24 px-6 md:px-10">
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-10">What patients say</h2>
        <div className="max-w-6xl mx-auto flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              data-testid="testimonial-card"
              className="snap-start shrink-0 w-[320px] border border-border rounded-lg p-6"
            >
              <p data-testid="testimonial-quote" className="font-serif italic leading-snug">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p data-testid="testimonial-attribution" className="text-sm text-muted mt-4">
                {t.name}, {t.city}
              </p>
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
