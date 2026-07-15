import { Metadata } from "next";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Reclaim Integrative Medicine",
  description:
    "Find answers to common questions about our Newport Beach naturopathic practice, services, and what to expect as a patient.",
};

export default function FAQsPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground font-medium tracking-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about our naturopathic practice,
            treatments, and what to expect on your wellness journey.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-16">
          {faqs.map((categoryGroup, index) => (
            <section key={index} className="scroll-mt-32" id={categoryGroup.category.toLowerCase().replace(/\s+/g, "-")}>
              <h2 className="font-serif text-3xl text-foreground mb-8 pb-4 border-b border-primary/20">
                {categoryGroup.category}
              </h2>
              <Accordion items={categoryGroup.questions} />
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 p-12 bg-primary/5 rounded-[2rem] border border-primary/10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground font-medium mb-6">
            Still Have Questions?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Our team is here to help you understand your options and guide you toward the right treatment plan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="bg-ink text-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-ink/85 gap-2 inline-flex items-center">
              Contact Our Office <ArrowRight weight="bold" />
            </Link>
            <Link href="/services" className="bg-transparent text-ink border border-ink px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-ink/5">
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
