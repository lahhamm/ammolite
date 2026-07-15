"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, CaretDown } from "@phosphor-icons/react/dist/ssr";

const SERVICES = [
  {
    name: "Hormone & Thyroid Optimization",
    description: "Restoring balance, energy, and vitality through personalized bioidentical hormone therapy and comprehensive thyroid care.",
    image: "/images/hormone-vitality.jpg",
  },
  {
    name: "Cellular Health & IV Therapy",
    description: "Customized nutrient infusions, vitamin injections, and advanced blood oxygenation for immediate absorption and detoxification.",
    image: "/images/iv-nutrient-therapy.jpg",
  },
  {
    name: "Gut Health & Metabolism",
    description: "Uncovering root causes through advanced labs to heal digestion and create sustainable weight management programs.",
    image: "/images/gut-microbiome-health.jpg",
  },
  {
    name: "Longevity & Regeneration",
    description: "Advanced therapies designed to resolve chronic fatigue, manage autoimmune conditions, and promote youthful skin.",
    image: "/images/peptides-weight-wellness.jpg",
  },
];

export function ServicesTeaser() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-16 md:py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <ScrollReveal>
          <div className="max-w-2xl mb-10 md:mb-16">
            <span className="text-sm uppercase tracking-widest text-accent-sage font-medium block mb-4">Our Expertise</span>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight">Care built around you</h2>
          </div>
        </ScrollReveal>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-12 lg:gap-20 relative">
        {/* Left Side: Sticky Images — desktop enhancement only */}
        <div className="hidden lg:block lg:w-1/2">
          <div className="lg:sticky lg:top-32 lg:h-[70vh] w-full rounded-2xl overflow-hidden bg-ink">
            {SERVICES.map((service, idx) => (
              <div
                key={service.name}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  activeIndex === idx ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-ink/10 mix-blend-multiply" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Tap-to-expand pillar list (click/tap is primary; hover enhances on desktop) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          {SERVICES.map((service, idx) => {
            const isActive = activeIndex === idx;
            const panelId = `expertise-panel-${idx}`;
            return (
              <ScrollReveal key={service.name} delay={idx * 0.1}>
                <div className="border-b border-ink/10">
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => setActiveIndex(idx)}
                    className="group flex w-full items-center justify-between gap-4 py-5 md:py-8 text-left"
                  >
                    <h3
                      className={`font-serif text-2xl md:text-4xl leading-tight transition-colors duration-500 ${
                        isActive ? "text-ink" : "text-ink/60 group-hover:text-ink"
                      }`}
                    >
                      {service.name}
                    </h3>
                    <CaretDown
                      weight="bold"
                      aria-hidden="true"
                      className={`shrink-0 text-accent-sage transition-transform duration-500 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    id={panelId}
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isActive ? "max-h-60 opacity-100 pb-6 md:pb-8" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="font-sans text-ink/80 text-base md:text-xl mb-6">
                      {service.description}
                    </p>
                    <Link href="/services" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-accent-sage font-medium hover:text-ink transition-colors">
                      Learn More <ArrowRight weight="bold" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}

          <div className="pt-10 md:pt-12">
            <Link href="/services" className="inline-flex items-center justify-center bg-transparent border border-ink text-ink hover:bg-ink hover:text-white px-8 py-4 rounded-full transition-colors duration-300 font-medium w-full md:w-auto">
              Explore All Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
