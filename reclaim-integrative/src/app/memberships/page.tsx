"use client";

import { useState } from "react";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Check, MoveRight, PhoneCall, Sparkle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";

const TRT_MEMBERSHIPS = [
  {
    title: "Standard TRT",
    description: "Everything you need to stay on protocol — medication, supplies, and provider oversight.",
    price: "$199",
    features: [
      "Testosterone medication",
      "Injection supplies & self-injection training",
      "Ongoing provider monitoring & secure messaging",
      "Discounted lab pricing (billed separately)",
      "Dose adjustments as clinically needed",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    title: "Premium Optimization",
    description: "Full optimization with deeper monitoring and ancillary medications when clinically indicated.",
    price: "$279",
    priceRange: "$279–$299",
    features: [
      "Everything in the Standard membership",
      "Quarterly comprehensive lab panels included",
      "Ancillary medications (e.g., anastrozole, HCG)",
      "More frequent provider check-ins",
      "Proactive dose adjustments based on labs",
      "Priority scheduling",
    ],
    cta: "Get Started",
    popular: true,
  },
];

const IV_MEMBERSHIPS = [
  {
    title: "Essential",
    description: "Perfect for maintenance & wellness. Maintain energy and immunity with a monthly boost.",
    price: "$99",
    features: [
      "1 Vitamin Shot per month",
      "10% off add-on injections",
      "10% off IV therapy sessions",
      "Priority scheduling",
      "Monthly wellness check-in",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    title: "Optimize",
    description: "Active professionals and athletes who want consistent optimization without overhauling their routine.",
    price: "$199",
    features: [
      "2 Vitamin Shots per month",
      "15% off add-on injections",
      "15% off IV therapy sessions",
      "Priority scheduling",
      "Quarterly wellness consultation",
      "Custom shot recommendations",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    title: "Premier",
    description: "High-performers, executives, and anyone seeking comprehensive recovery and peak performance.",
    price: "$349",
    features: [
      "4 Vitamin Shots per month",
      "1 IV Therapy session per month",
      "20% off all add-on services",
      "Priority scheduling",
      "Monthly wellness consultation",
      "Custom IV & shot protocols",
    ],
    cta: "Get Started",
    popular: false,
  },
];

const EBOO_MEMBERSHIPS = [
  {
    title: "EBOO Therapy Consultation",
    description: "The most advanced form of medical ozone therapy available for deep immune support and detoxification.",
    price: "Custom",
    features: [
      "Initial consultation with physician",
      "Thorough review of health history & labs",
      "45-60 minute physician-supervised treatment",
      "Medical-grade dialysis membrane filtration",
      "Recovery and follow-up plan",
    ],
    cta: "Book an Appointment",
    popular: true,
  },
];

const TABS = ["TRT", "Vitamin Shot & IV", "EBOO Therapy"];

export default function MembershipsPage() {
  const [activeTab, setActiveTab] = useState("TRT");

  let currentMemberships = TRT_MEMBERSHIPS;
  if (activeTab === "Vitamin Shot & IV") currentMemberships = IV_MEMBERSHIPS;
  if (activeTab === "EBOO Therapy") currentMemberships = EBOO_MEMBERSHIPS;

  // Card CTAs enter the booking flow at the closest matching point.
  let bookingHref = "/book?service=trt-injection";
  if (activeTab === "Vitamin Shot & IV") bookingHref = "/book?category=iv-therapy";
  if (activeTab === "EBOO Therapy") bookingHref = "/book?service=eboo";

  return (
    <main className="pt-[72px] bg-canvas/30 min-h-screen">
      <SiteNav />

      {/* Header Section */}
      <section className="py-24 px-6 md:px-10 max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <Badge className="bg-accent-sage/10 text-accent-sage hover:bg-accent-sage/20 border-0 mb-6 py-1.5 px-4 font-serif font-medium uppercase tracking-widest rounded-full">
            Memberships & Programs
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-6 text-ink">
            Consistent wellness starts with consistent care.
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Choose a plan that fits your lifestyle. Our comprehensive programs go beyond simple treatments to optimize your health for peak performance with ongoing support.
          </p>
        </ScrollReveal>
      </section>

      {/* Mini Navbar (Tabs) */}
      <section className="px-6 md:px-10 max-w-4xl mx-auto mb-16">
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 p-1.5 bg-white border border-border rounded-full shadow-sm w-fit mx-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-ink text-white shadow-md"
                    : "bg-transparent text-muted hover:text-ink"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 md:px-10 max-w-6xl mx-auto pb-24">
        <ScrollReveal delay={0.2}>
          <div className={`grid gap-8 ${currentMemberships.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : currentMemberships.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
            <AnimatePresence mode="popLayout">
              {currentMemberships.map((membership, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  key={membership.title}
                  className="h-full"
                >
                  <Card className={`relative w-full h-full flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 border ${membership.popular ? 'border-accent-sage shadow-lg shadow-accent-sage/10' : 'border-border bg-white shadow-sm'}`}>

                    {membership.popular && (
                      <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                        <span className="bg-accent-sage text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Sparkle size={12} fill="currentColor" strokeWidth={1.5} /> Most Popular
                        </span>
                      </div>
                    )}

                    <CardHeader className="pt-8 pb-4">
                      <CardTitle className="font-serif text-2xl text-ink">
                        {membership.title}
                      </CardTitle>
                      <CardDescription className="text-muted text-sm mt-2 min-h-[40px]">
                        {membership.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-grow justify-start pt-0">
                      <div className="mb-8">
                        <p className="flex flex-row items-baseline gap-1 text-ink">
                          <span className="text-5xl font-serif leading-tight">{membership.priceRange || membership.price}</span>
                          {membership.price !== "Custom" && (
                            <span className="text-sm text-muted"> / month</span>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 justify-start flex-grow mb-8">
                        {membership.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex flex-row gap-3 items-start">
                            <Check className="w-4 h-4 mt-1 text-accent-sage flex-shrink-0" strokeWidth={1.5} />
                            <p className="text-sm text-ink/80 leading-snug">
                              {feature}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="primary"
                        href={bookingHref}
                        className={`w-full gap-2 rounded-xl h-12 text-sm inline-flex items-center justify-center ${membership.popular ? '' : 'bg-transparent border border-border text-ink hover:bg-accent-sage/5'}`}
                      >
                        {membership.cta} {membership.price === "Custom" ? <PhoneCall className="w-4 h-4" strokeWidth={1.5} /> : <MoveRight className="w-4 h-4" strokeWidth={1.5} />}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </section>

      {/* Info Section based on active tab */}
      <section className="bg-white py-16 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-2xl text-ink mb-6 text-center">
              {activeTab === "TRT" ? "Membership Terms & How Labs Are Billed" : activeTab === "Vitamin Shot & IV" ? "Popular Vitamin Shots Included" : "What is EBOO Therapy?"}
            </h2>
            <div className="text-muted text-sm leading-relaxed space-y-4">
              {activeTab === "TRT" && (
                <>
                  <p><strong>Standard TRT ($199/mo):</strong> Labs are billed separately at a deeply discounted rate through our recommended lab partners. You only pay for the labs you need, when you need them — no insurance required.</p>
                  <p><strong>Premium Optimization ($279–$299/mo):</strong> Quarterly monitoring labs are included in your membership — no separate lab bills for your routine TRT monitoring panels.</p>
                  <p><strong>Terms:</strong> Monthly billing on the 1st of each month. Requires a 3-month contract commitment. A credit card must remain on file. After the initial 3 months, membership renews monthly unless cancelled with 30 days&apos; written notice.</p>
                </>
              )}
              {activeTab === "Vitamin Shot & IV" && (
                <>
                  <p>Your membership shots can be any of our most popular injections — mix and match each month based on your goals: B12 Energy Shot, Glutathione Shot, Tri-Immune Shot, Biotin Shot, MIC Fat Burner, Vitamin D, Amino Acid, NAD+, Liver Detox, or Stress Relief Shot.</p>
                  <p><strong>Terms:</strong> No long-term contracts — cancel anytime with 30 days&apos; notice. Unused shots do not roll over. Billed on the 1st of each month. A credit card must remain on file.</p>
                </>
              )}
              {activeTab === "EBOO Therapy" && (
                <>
                  <p>EBOO stands for Extracorporeal Blood Oxygenation and Ozonation. Unlike standard IV ozone, EBOO filters and recirculates your blood through a medical-grade dialysis membrane while infusing it with medical ozone and oxygen. It&apos;s the most thorough form of ozone therapy available today.</p>
                  <p>The procedure processes a larger volume of blood than any other ozone method, making it significantly more effective for immune activation and circulatory support. Ideal for chronic fatigue, Lyme disease, mold toxicity, and autoimmune conditions.</p>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
