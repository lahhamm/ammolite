"use client";

import { useState } from "react";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import { 
  ClipboardList, 
  Droplets, 
  Syringe, 
  Activity, 
  Apple, 
  Scale, 
  BatteryLow, 
  ShieldAlert, 
  Infinity as InfinityIcon, 
  Sparkles, 
  Wind 
} from "lucide-react";

const ALL_SERVICES = [
  {
    title: "Comprehensive Labs",
    description: "Advanced diagnostic testing to uncover the root causes of your health concerns.",
    categories: ["Diagnostics", "Gut & Digestion", "Hormones"],
    icon: ClipboardList,
  },
  {
    title: "Hormone Replacement",
    description: "Restore hormonal balance with personalized bioidentical hormone therapy including Biote Pellets.",
    categories: ["Hormones", "Anti-Aging & Aesthetics"],
    icon: Droplets,
  },
  {
    title: "IV Therapy",
    description: "Customized nutrient infusions for maximum absorption and immediate results.",
    categories: ["Energy & Fatigue", "Immunity & Detox"],
    icon: Syringe,
  },
  {
    title: "Vitamin & Nutrient Injections",
    description: "B12, glutathione, NAD+, fat burner & Mega B shots for quick energy, immunity, and metabolism support.",
    categories: ["Energy & Fatigue", "Immunity & Detox"],
    icon: Activity,
  },
  {
    title: "Digestive Health",
    description: "Heal your gut and restore optimal digestion for whole-body wellness.",
    categories: ["Gut & Digestion", "Immunity & Detox"],
    icon: Apple,
  },
  {
    title: "Weight Management",
    description: "Sustainable weight management programs tailored to your health needs and goals.",
    categories: ["Weight & Metabolism"],
    icon: Scale,
  },
  {
    title: "Thyroid Health",
    description: "Comprehensive thyroid evaluation and optimization for metabolism, energy, and well-being.",
    categories: ["Hormones", "Weight & Metabolism"],
    icon: Activity,
  },
  {
    title: "Chronic Fatigue",
    description: "Identify root causes and restore your energy with personalized fatigue recovery protocols.",
    categories: ["Energy & Fatigue", "Immunity & Detox"],
    icon: BatteryLow,
  },
  {
    title: "Autoimmune Disorders",
    description: "Natural approaches to manage autoimmune conditions and reduce inflammation.",
    categories: ["Immunity & Detox", "Gut & Digestion"],
    icon: ShieldAlert,
  },
  {
    title: "Longevity Medicine",
    description: "Advanced longevity therapies to promote healing, extend vitality, and whole-body rejuvenation.",
    categories: ["Anti-Aging & Aesthetics", "Energy & Fatigue"],
    icon: InfinityIcon,
  },
  {
    title: "Aesthetics",
    description: "Microneedling with PRP and exosomes for skin rejuvenation, collagen restoration, and a youthful glow.",
    categories: ["Anti-Aging & Aesthetics"],
    icon: Sparkles,
  },
  {
    title: "EBOO Therapy",
    description: "Extracorporeal Blood Oxygenation and Ozonation for advanced detoxification and cellular rejuvenation.",
    categories: ["Immunity & Detox", "Anti-Aging & Aesthetics"],
    icon: Wind,
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
import { Suspense, useEffect } from "react";

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (initialCategory && CATEGORIES.includes(initialCategory)) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

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
                className="group border border-border bg-white p-8 rounded-2xl hover:shadow-xl hover:shadow-black/5 transition-shadow duration-300 flex flex-col justify-between"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-sage/10 text-accent-sage group-hover:bg-accent-sage group-hover:text-white transition-colors duration-300 shrink-0">
                      <service.icon size={20} strokeWidth={1.5} />
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
          <Button variant="gold" className="mx-auto">Book an Appointment</Button>
        </ScrollReveal>
      </section>

      <SiteFooter />
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
