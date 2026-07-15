"use client";

import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { MoveRight, Droplets, Activity, Apple, ShieldAlert, Wind, BatteryLow, Brain, Sparkles, UserRound, Flower2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

const CONDITIONS = [
  {
    title: "Hormonal Imbalances",
    description: "Menopause, Perimenopause, PCOS, Low Testosterone, and hormonal disruptions.",
    icon: Droplets,
    category: "Hormones",
  },
  {
    title: "Thyroid Conditions",
    description: "Hashimoto's, Hypothyroid, Hyperthyroid, and other thyroid disorders.",
    icon: Activity,
    category: "Hormones",
  },
  {
    title: "Digestive Issues",
    description: "IBS, SIBO, Leaky Gut, Food Sensitivities, and gut health disorders.",
    icon: Apple,
    category: "Gut & Digestion",
  },
  {
    title: "Autoimmune Conditions",
    description: "Rheumatoid Arthritis, Lupus, MS, Psoriasis, and other autoimmune disorders.",
    icon: ShieldAlert,
    category: "Immunity & Detox",
  },
  {
    title: "Mold Exposure",
    description: "Mold toxicity, mycotoxin illness, and environmental exposure recovery.",
    icon: Wind,
    category: "Immunity & Detox",
  },
  {
    title: "Chronic Fatigue",
    description: "Persistent exhaustion, low energy, and fatigue syndromes that don't resolve with rest.",
    icon: BatteryLow,
    category: "Energy & Fatigue",
  },
  {
    title: "Mood Disorders",
    description: "Anxiety, depression, irritability, and emotional wellness through root cause medicine.",
    icon: Brain,
    category: "All",
  },
  {
    title: "Hair Loss",
    description: "Thinning hair, alopecia, and hair loss caused by hormonal, nutritional, or autoimmune factors.",
    icon: Sparkles,
    category: "Anti-Aging & Aesthetics",
  },
  {
    title: "Men's Health",
    description: "Low testosterone, fatigue, weight gain, libido issues, and hormonal optimization for men.",
    icon: UserRound,
    category: "Hormones",
  },
  {
    title: "Women's Health",
    description: "Hormonal balance, fertility support, menstrual health, and comprehensive care for women.",
    icon: Flower2,
    category: "Hormones",
  },
];

export default function ConditionsTreatedPage() {
  return (
    <main className="pt-[72px] bg-canvas/30 min-h-screen">
      <SiteNav />

      {/* Header Section */}
      <section className="pt-24 pb-16 px-6 md:px-10 max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6 text-ink">
            Conditions We Treat
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            We specialize in identifying root causes and providing natural, effective treatments for a wide range of complex health conditions.
          </p>
        </ScrollReveal>
      </section>

      {/* Editorial List Section */}
      <section className="px-6 md:px-10 max-w-5xl mx-auto pb-24">
        <div className="border-t border-border">
          {CONDITIONS.map((condition, idx) => (
            <ScrollReveal key={condition.title} delay={idx * 0.05}>
              <Link href={`/services?category=${encodeURIComponent(condition.category)}`} className="group block">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 md:gap-8 items-center py-8 border-b border-border transition-colors hover:bg-white/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-sage/10 text-accent-sage group-hover:bg-accent-sage group-hover:text-white transition-colors duration-300 shrink-0">
                      <condition.icon size={20} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-2xl text-ink group-hover:text-accent-sage transition-colors">
                      {condition.title}
                    </h3>
                  </div>
                  <p className="text-muted text-base leading-relaxed md:pr-12">
                    {condition.description}
                  </p>
                  <div className="hidden md:flex justify-end opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                    <MoveRight className="text-accent-sage" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Catch-all CTA */}
      <section className="bg-white py-24 px-6 border-t border-border text-center">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-ink mb-6">
              Don&apos;t See Your Condition?
            </h2>
            <p className="text-muted text-lg mb-8 leading-relaxed">
              We treat many conditions not listed here. Schedule a consultation to discuss your specific health concerns and explore how root-cause medicine can help you reclaim your health.
            </p>
            <Button
              variant="primary"
              href="/book?category=consultations"
              className="h-14 px-8 text-base rounded-sm"
            >
              Book an Appointment
            </Button>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </main>
  );
}
