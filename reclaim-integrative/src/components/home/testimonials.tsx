"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";

const testimonials: Testimonial[] = [
  {
    text: "After years of being told my labs were normal, Dr. Colon finally found the root cause. My energy is back, and I feel like myself again.",
    image: "https://picsum.photos/seed/reclaim-t1/150/150",
    name: "Sarah Jenkins",
    role: "Patient since 2023",
  },
  {
    text: "The combination of EBOO therapy and targeted hormone optimization completely reversed my chronic fatigue. Incredible care and attention to detail.",
    image: "https://picsum.photos/seed/reclaim-t2/150/150",
    name: "Michael Torres",
    role: "Patient since 2024",
  },
  {
    text: "Dr. Andrea listens like no other doctor I've met. She looks at the whole picture instead of just treating isolated symptoms.",
    image: "https://picsum.photos/seed/reclaim-t3/150/150",
    name: "Emily Chen",
    role: "Patient since 2022",
  },
  {
    text: "My thyroid issues were completely ignored by traditional medicine. Reclaim Integrative gave me a customized plan that actually works.",
    image: "https://picsum.photos/seed/reclaim-t4/150/150",
    name: "David Alby",
    role: "Patient since 2023",
  },
  {
    text: "The IV therapy and peptide treatments have been a game-changer for my athletic recovery. Highly recommend this clinic.",
    image: "https://picsum.photos/seed/reclaim-t5/150/150",
    name: "Jessica Rivera",
    role: "Patient since 2024",
  },
  {
    text: "Finally, a medical practice that focuses on optimal health rather than just managing disease. The team is simply outstanding.",
    image: "https://picsum.photos/seed/reclaim-t6/150/150",
    name: "Robert Hughes",
    role: "Patient since 2023",
  },
  {
    text: "I was skeptical about integrative medicine, but the results speak for themselves. My digestion and sleep have never been better.",
    image: "https://picsum.photos/seed/reclaim-t7/150/150",
    name: "Amanda Smith",
    role: "Patient since 2022",
  },
  {
    text: "Dr. Colon is brilliant. She explained exactly how my hormones were affecting my mood and gave me a clear path forward.",
    image: "https://picsum.photos/seed/reclaim-t8/150/150",
    name: "Thomas Wright",
    role: "Patient since 2024",
  },
  {
    text: "The best medical care I have ever received. They take the time to dig deep into your health history.",
    image: "https://picsum.photos/seed/reclaim-t9/150/150",
    name: "Elena Rodriguez",
    role: "Patient since 2023",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function Testimonials() {
  return (
    <section className="py-24 px-6 md:px-10 bg-canvas relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm uppercase tracking-widest text-accent-sage font-medium block mb-4">Patient Stories</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">Real results. <br/> True healing.</h2>
            <p className="text-ink/80 text-lg">
              Hear from our patients about their journey to optimal health with Dr. Andrea Colon.
            </p>
          </div>
        </ScrollReveal>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[600px] overflow-hidden -mx-6 md:mx-0">
          <TestimonialsColumn testimonials={firstColumn} duration={25} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={28} />
        </div>
      </div>
    </section>
  );
}
