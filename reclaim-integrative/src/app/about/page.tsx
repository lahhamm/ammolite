import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import Image from "next/image";

// Mirrors the STATS source on /press and the homepage credibility section.
const ABOUT_PRESS_STATS = [
  { value: "3B+", label: "Media impressions" },
  { value: "11+", label: "Press features" },
  { value: "7+", label: "Podcast appearances" },
  { value: "117M+", label: "Monthly readers reached" },
];

export default function AboutPage() {
  return (
    <main className="pt-[72px]">
      <SiteNav />
      
      <section className="pt-16 pb-16 px-6 md:px-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <ScrollReveal>
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <Image
              src="/images/dr-andrea-colon.png"
              alt="Dr. Andrea Colon, NMD"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </ScrollReveal>
        
        <ScrollReveal>
          <div>
            <span className="text-sm uppercase tracking-widest text-accent-sage font-medium block mb-4">Founder &amp; Lead Physician</span>
            <h1 className="font-serif text-4xl md:text-5xl mb-6">Dr. Andrea Colon, NMD</h1>
            <div className="space-y-4 text-muted text-lg leading-relaxed">
              <p>
                Dr. Andrea Colon is a licensed Naturopathic Doctor with a deep passion for helping patients heal from the inside out. She specializes in hormone optimization, gut health, IV and peptide therapy, and personalized wellness programs that address the root causes of fatigue, hormone imbalances, inflammation, and chronic health issues. She currently practices in Newport Beach and Rancho Cucamonga, California.
              </p>
              <p>
                Her mission is to empower patients to take control of their health and feel vibrant at every stage of life, using a holistic approach that&apos;s grounded in medical insight and compassionate care.
              </p>
              <p>
                At her practice, she offers IV therapy, comprehensive lab testing, peptide therapy, bioidentical hormone replacement, and functional wellness consultations.
              </p>
              <p>
                When she&apos;s not in the clinic, you&apos;ll find her practicing pilates, traveling, or enjoying time with her two Pomeranians, Rocco and Theodore.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="py-20 bg-ink text-canvas px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl leading-relaxed italic">
              I take my time to listen to your healthcare concerns in order to fully understand your needs and work with you to achieve your healthcare goals.
            </h2>
            <p className="mt-6 text-canvas/60 text-sm uppercase tracking-widest">Dr. Andrea Colon, NMD</p>
            <p className="mt-8 text-canvas/70 text-base leading-relaxed not-italic">
              Her care follows the six principles of naturopathic medicine: First Do No Harm, Identify and Treat the Cause, The Healing Power of Nature, Doctor as Teacher, Treat the Whole Person, and Prevention.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 md:px-10 max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Recognized by the press</h2>
            <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
              Dr. Colon is a trusted expert voice, featured in national outlets including GQ, Marie Claire, and Good Housekeeping, and a regular guest on wellness podcasts.
            </p>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {ABOUT_PRESS_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl text-accent-sage">{stat.value}</p>
                  <p className="text-sm text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Button variant="text" href="/press">
                Explore her features in the press
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="py-20 px-6 md:px-10 max-w-5xl mx-auto">
        <ScrollReveal>
          <h2 className="font-serif text-3xl mb-10 text-center">Education &amp; Credentials</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">Naturopathic Medical Doctorate</h3>
              <p className="text-muted text-sm">Southwest College of Naturopathic Medicine (SCNM)</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">Licensed Naturopathic Doctor</h3>
              <p className="text-muted text-sm">State of California</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">Biote Certified</h3>
              <p className="text-muted text-sm">Bioidentical hormone replacement therapy</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">IV Therapy Certified</h3>
              <p className="text-muted text-sm">Intravenous nutrient and hydration therapy</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="py-20 px-6 md:px-10 bg-canvas">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl mb-12 text-center text-foreground">
              About Our Practice
            </h2>
            <Accordion items={faqs.find((f) => f.category === "About Our Practice")?.questions || []} />
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
