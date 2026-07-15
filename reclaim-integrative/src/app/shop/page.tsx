"use client";

import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function ShopPage() {
  return (
    <main className="pt-[72px] bg-canvas min-h-screen flex flex-col">
      <SiteNav />

      {/* Side-by-Side Shop Content */}
      <section className="flex-grow px-6 md:px-10 py-12 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* Dispensary Section */}
          <ScrollReveal>
            <div className="bg-accent-sage/10 rounded-2xl p-10 md:p-12 lg:p-16 border border-accent-sage/20 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex-1 flex flex-col items-start justify-start text-left w-full">
                <span className="text-sm uppercase tracking-widest text-muted mb-4 block font-medium">🌿 Supplements 🌿</span>
                <h2 className="font-serif text-3xl md:text-4xl mb-6 text-ink">
                  Fullscript Dispensary
                </h2>
                <p className="text-muted text-base md:text-lg max-w-sm leading-relaxed">
                  Order premium, practitioner-grade supplements directly through our secure Fullscript dispensary.
                </p>
              </div>
              <div className="mt-10 flex justify-start w-full">
                <a href="https://us.fullscript.com/welcome/acolon1582244597/store-start?utm_medium=webreferral&utm_source=other&utm_campaign=abmwebbuttons_light_500x500.svg&signup_source=website_buttons" target="_blank" rel="noopener noreferrer">
                  <button className="bg-ink text-white px-8 py-4 rounded-sm transition-colors duration-200 hover:bg-ink/85 font-medium shadow-sm w-full sm:w-auto">
                    Access Our Dispensary
                  </button>
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* BEMER Therapy Section */}
          <ScrollReveal delay={0.1}>
            <div className="bg-accent-sage/10 rounded-2xl p-10 md:p-12 lg:p-16 border border-accent-sage/20 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex-1 flex flex-col items-start justify-start text-left w-full">
                <span className="text-sm uppercase tracking-widest text-muted mb-4 block font-medium">✨ BEMER Therapy ✨</span>
                <h2 className="font-serif text-3xl md:text-4xl mb-6 text-ink">Unlock Your Body's Healing Potential</h2>
                <p className="text-muted text-base md:text-lg leading-relaxed mb-10 max-w-md">
                  BEMER uses pulsed electromagnetic field (PEMF) technology to stimulate healthy microcirculation — the foundation of vitality, recovery, and long-term wellness.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 text-left max-w-xl w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-accent-sage text-2xl leading-none">•</span>
                    <span className="text-ink font-medium text-sm">Enhanced Blood Flow</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent-sage text-2xl leading-none">•</span>
                    <span className="text-ink font-medium text-sm">Increased Energy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent-sage text-2xl leading-none">•</span>
                    <span className="text-ink font-medium text-sm">Cardiovascular Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent-sage text-2xl leading-none">•</span>
                    <span className="text-ink font-medium text-sm">Faster Recovery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent-sage text-2xl leading-none">•</span>
                    <span className="text-ink font-medium text-sm">Immune Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent-sage text-2xl leading-none">•</span>
                    <span className="text-ink font-medium text-sm">Better Sleep & Relaxation</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-start w-full">
                <a href="https://bemergroup.com/en_US/human-line/products/overview" target="_blank" rel="noopener noreferrer">
                  <button className="bg-ink text-white px-8 py-4 rounded-sm transition-colors duration-200 hover:bg-ink/85 font-medium shadow-sm w-full sm:w-auto">
                    Learn More About BEMER
                  </button>
                </a>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
