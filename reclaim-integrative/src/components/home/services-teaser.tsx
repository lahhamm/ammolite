"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

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

import { useState } from "react";

export function ServicesTeaser() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <ScrollReveal>
          <div className="max-w-2xl mb-16">
            <span className="text-sm uppercase tracking-widest text-accent-sage font-medium block mb-4">Our Expertise</span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">Care built around you</h2>
          </div>
        </ScrollReveal>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-12 lg:gap-20 relative">
        {/* Left Side: Sticky Images */}
        <div className="w-full lg:w-1/2">
          <div className="lg:sticky lg:top-32 h-[400px] lg:h-[70vh] w-full rounded-[32px] overflow-hidden bg-ink shadow-2xl">
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
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-ink/10 mix-blend-multiply" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Services List */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          {SERVICES.map((service, idx) => (
            <ScrollReveal key={service.name} delay={idx * 0.1}>
              <div
                className="py-8 md:py-12 border-b border-ink/10 cursor-pointer group"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => setActiveIndex(idx)}
              >
                <h3 className={`font-serif text-3xl md:text-4xl leading-tight transition-colors duration-500 mb-2 ${activeIndex === idx ? 'text-ink' : 'text-ink/40 group-hover:text-ink/70'}`}>
                  {service.name}
                </h3>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeIndex === idx ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <p className="font-sans text-ink/80 text-lg md:text-xl mb-6">
                    {service.description}
                  </p>
                  <Link href="/services" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-accent-sage font-medium hover:text-ink transition-colors">
                    Learn More <ArrowRight weight="bold" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
          
          <div className="pt-12">
            <Link href="/services" className="inline-flex items-center justify-center bg-transparent border border-ink text-ink hover:bg-ink hover:text-white px-8 py-4 rounded-full transition-colors duration-300 font-medium w-full md:w-auto">
              Explore All Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
