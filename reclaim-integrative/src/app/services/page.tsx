"use client";

import { useState } from "react";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import Link from "next/link";
import {
  Atom,
  Barbell,
  BatteryCharging,
  ClipboardText,
  Drop,
  Fire,
  Flask,
  Heartbeat,
  Leaf,
  Lightning,
  Scales,
  ShieldCheck,
  Sparkle,
  Syringe,
  TestTube,
} from "@phosphor-icons/react/dist/ssr";

// Every card deep-links into the booking flow. Services with no directly
// bookable item route to the nearest sensible category.
const ALL_SERVICES = [
  {
    title: "New Patient Consultation",
    description: "Begin with a detailed health history and a personalized root-cause plan.",
    categories: ["Diagnostics"],
    icon: ClipboardText,
    href: "/book?category=consultations",
  },
  {
    title: "Hormone Therapy",
    description: "Restore hormonal balance with personalized bioidentical hormone therapy.",
    categories: ["Hormones", "Anti-Aging & Aesthetics"],
    icon: Atom,
    href: "/book?category=consultations",
  },
  {
    title: "TRT Treatment",
    description: "Physician-guided testosterone replacement with ongoing monitoring.",
    categories: ["Hormones", "Energy & Fatigue"],
    icon: Barbell,
    href: "/book?service=trt-injection",
  },
  {
    title: "IV Therapy",
    description: "Customized nutrient infusions for maximum absorption and immediate results.",
    categories: ["Energy & Fatigue", "Immunity & Detox"],
    icon: Drop,
    href: "/book?category=iv-therapy",
  },
  {
    title: "Peptide Therapy",
    description: "Targeted peptides to support recovery, metabolism, and healthy aging.",
    categories: ["Anti-Aging & Aesthetics", "Weight & Metabolism"],
    icon: Flask,
    href: "/book?category=consultations",
  },
  {
    title: "B12 Injections",
    description: "Quick B12 shots to improve energy, immune support, and mental clarity.",
    categories: ["Energy & Fatigue"],
    icon: Lightning,
    href: "/book?service=b12-vitamin-shot",
  },
  {
    title: "Mega B Injections",
    description: "B12 plus B Complex in one shot to support steady energy levels.",
    categories: ["Energy & Fatigue"],
    icon: BatteryCharging,
    href: "/book?service=mega-b-vitamin-shot",
  },
  {
    title: "Fat Burner Injections",
    description: "Boost natural energy, target belly fat, and support liver health.",
    categories: ["Weight & Metabolism"],
    icon: Fire,
    href: "/book?service=fat-burner-vitamin-shot",
  },
  {
    title: "NAD+ Injections",
    description: "Cellular energy and repair support for focus and healthy aging.",
    categories: ["Energy & Fatigue", "Anti-Aging & Aesthetics"],
    icon: Sparkle,
    href: "/book?service=iv-nad-250",
  },
  {
    title: "Glutathione Injections",
    description: "The master antioxidant for detox, immunity, and recovery.",
    categories: ["Immunity & Detox"],
    icon: ShieldCheck,
    href: "/book?service=glutathione-push",
  },
  {
    title: "Alpha Lipoic Acid IV",
    description: "Antioxidant infusion to support nerve health and detoxification.",
    categories: ["Immunity & Detox", "Energy & Fatigue"],
    icon: Leaf,
    href: "/book?category=iv-therapy",
  },
  {
    title: "Alpha Lipoic Acid Injection",
    description: "A quick antioxidant shot to support metabolism and nerve health.",
    categories: ["Immunity & Detox"],
    icon: Syringe,
    href: "/book?category=im-shots",
  },
  {
    title: "Weight Management",
    description: "Sustainable, medically guided weight programs tailored to your goals.",
    categories: ["Weight & Metabolism"],
    icon: Scales,
    href: "/book?service=semaglutide",
  },
  {
    title: "EBOO Therapy",
    description: "Extracorporeal blood oxygenation and ozonation for deep detoxification.",
    categories: ["Immunity & Detox", "Anti-Aging & Aesthetics"],
    icon: Heartbeat,
    href: "/book?service=eboo",
  },
  {
    title: "Comprehensive Labs",
    description: "Advanced diagnostic testing to uncover the root causes of your symptoms.",
    categories: ["Diagnostics"],
    icon: TestTube,
    href: "/book?service=blood-draw",
  },
];

const CATEGORIES = [
  "All", 
  "Energy & Fatigue", 
  "Hormones", 
  "Gut & Digestion", 
  "Weight & Metabolism", 
  "Anti-Aging & Aesthetics", 
  "Immunity & Detox", 
  "Diagnostics"
];

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState(() =>
    initialCategory && CATEGORIES.includes(initialCategory) ? initialCategory : "All",
  );

  const filteredServices = ALL_SERVICES.filter(service => 
    activeCategory === "All" ? true : service.categories.includes(activeCategory)
  );

  return (
    <main className="pt-[72px]">
      <SiteNav />

      <section className="py-24 px-6 md:px-10 max-w-6xl mx-auto text-center">
        <ScrollReveal>
          <span className="text-sm uppercase tracking-widest text-accent-sage font-medium block mb-4">Our Services</span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
            Comprehensive naturopathic care
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Every treatment plan is personalized by our team of naturopathic doctors to your unique needs, helping you achieve optimal health and vitality.
          </p>
        </ScrollReveal>
      </section>

      <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  activeCategory === category 
                    ? "bg-ink text-white shadow-md" 
                    : "bg-transparent text-muted hover:text-ink hover:bg-black/5"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                key={service.title}
                className="group border border-border bg-white rounded-2xl hover:shadow-xl hover:shadow-black/5 transition-shadow duration-300"
              >
                <Link
                  href={service.href}
                  aria-label={`Book ${service.title}`}
                  className="flex h-full flex-col justify-between p-8 focus-visible:outline-2 focus-visible:outline-accent-sage rounded-2xl"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-sage/10 text-accent-sage group-hover:bg-accent-sage group-hover:text-white transition-colors duration-300 shrink-0">
                        <service.icon size={20} weight="regular" aria-hidden="true" />
                      </div>
                      <h3 className="font-serif text-2xl text-ink mt-0.5">{service.title}</h3>
                    </div>
                    <p className="text-muted leading-relaxed text-base mb-6 flex-grow">{service.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {service.categories.map(cat => (
                      <span key={cat} className="text-[10px] uppercase tracking-wider text-accent-sage bg-accent-sage/10 px-2 py-1 rounded-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="py-24 px-6 md:px-10 max-w-4xl mx-auto border-t border-border mt-12">
        <ScrollReveal>
          <div className="mb-16">
            <h2 className="font-serif text-3xl md:text-4xl mb-8 text-ink">Treatments & Services FAQs</h2>
            <Accordion items={faqs.find((f) => f.category === "Treatments & Services")?.questions || []} />
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-8 text-ink">Lab Work & Testing FAQs</h2>
            <Accordion items={faqs.find((f) => f.category === "Lab Work & Testing")?.questions || []} />
          </div>
        </ScrollReveal>
      </section>

      <section className="py-16 mt-12 bg-ink text-canvas px-6 md:px-10 text-center">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6">Ready to reclaim your health?</h2>
          <p className="text-canvas/70 mb-8 max-w-lg mx-auto">Schedule a consultation to start your personalized health protocol.</p>
          <Button variant="inverse" href="/book" className="mx-auto">
            Book an Appointment
          </Button>
        </ScrollReveal>
      </section>

      <SiteFooter showBookingBand={false} />
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="pt-[72px] min-h-screen bg-canvas/30" />}>
      <ServicesContent />
    </Suspense>
  );
}
