import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";
import Image from "next/image";

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
                Dr. Andrea Colon is a licensed Naturopathic Medical Doctor practicing in Newport Beach, California. She is a graduate of Southwest College of Naturopathic Medicine (now Sonoran University of Health Sciences) in Tempe, Arizona, and holds active licenses in both California and Connecticut.
              </p>
              <p>
                She founded Reclaim Integrative Medicine with a singular focus: to identify and treat the root causes of chronic health issues rather than simply managing symptoms. Her integrative approach combines advanced functional lab testing, bio-identical hormone therapy, IV nutrient protocols, peptide therapy, and clinical nutrition.
              </p>
              <p>
                Dr. Colon specializes in women&apos;s hormonal health (including peri-menopause and menopause), thyroid and adrenal disorders, autoimmune conditions such as Hashimoto&apos;s and fibromyalgia, gastrointestinal disorders, and men&apos;s health optimization.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="py-20 bg-ink text-canvas px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl leading-relaxed italic">
              We treat the patient as a whole, not a single symptom.
            </h2>
            <p className="mt-6 text-canvas/60 text-sm uppercase tracking-widest">Dr. Andrea Colon, NMD</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 px-6 md:px-10 max-w-5xl mx-auto">
        <ScrollReveal>
          <h2 className="font-serif text-3xl mb-10 text-center">Education &amp; Credentials</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">Naturopathic Medical Doctorate</h3>
              <p className="text-muted text-sm">Sonoran University of Health Sciences (formerly SCNM), Tempe, AZ</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">Licensed NMD</h3>
              <p className="text-muted text-sm">State of California &amp; State of Connecticut</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">Published Author</h3>
              <p className="text-muted text-sm">iHerb Wellness Hub, Natural Nutmeg Magazine</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">Media Expert</h3>
              <p className="text-muted text-sm">Featured in Good Housekeeping, Marie Claire, VoyageLA</p>
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
