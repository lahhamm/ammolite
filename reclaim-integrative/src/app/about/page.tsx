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
                Dr. Andrea Colon is a Naturopathic Doctor licensed in the states of Connecticut and California. She is currently practicing in Corona Del Mar in the beautiful neighborhood of Newport Beach, California.
              </p>
              <p>
                She is a graduate of Southwest College of Naturopathic Medicine in Tempe, Arizona. Prior to enrolling in medical school, she was pursuing a career in the entertainment industry. Her own health struggles and a passion for helping others ultimately led her down the road to Naturopathic Medicine.
              </p>
              <p>
                Born and raised on the shoreline in New England, Dr. Colon enjoys going to music festivals, dancing, cooking, volunteering, traveling, and going on adventures with her dog, Rocco, in her spare time.
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
              <p className="text-muted text-sm">Southwest College of Naturopathic Medicine, Tempe, AZ</p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-medium mb-2">Licensed NMD</h3>
              <p className="text-muted text-sm">State of California &amp; State of Connecticut</p>
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
