import { Hero } from "@/components/home/hero";
import { PressLogoWall } from "@/components/home/press-logo-wall";
import { HeroScrollTransition } from "@/components/home/hero-scroll-transition";
import { Philosophy } from "@/components/home/philosophy";
import { ServicesTeaser } from "@/components/home/services-teaser";
import { CuratedCredibility } from "@/components/home/curated-credibility";
import { Testimonials } from "@/components/home/testimonials";
import { TherapyHighlight } from "@/components/home/therapy-highlight";
import { FinalCta } from "@/components/home/final-cta";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <main>
      <HeroScrollTransition
        hero={<Hero posterSrc="https://picsum.photos/seed/reclaim-hero/1920/1080" />}
        pressLogoWall={<PressLogoWall />}
      />
      <Philosophy />
      <ServicesTeaser />
      <CuratedCredibility />
      <Testimonials />
      <TherapyHighlight />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
