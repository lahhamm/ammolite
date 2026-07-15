import { SiteNav } from "@/components/layout/site-nav";
import { Hero } from "@/components/home/hero";
import { PressLogoWall } from "@/components/home/press-logo-wall";
import { HeroScrollTransition } from "@/components/home/hero-scroll-transition";
import { Philosophy } from "@/components/home/philosophy";
import { ServicesTeaser } from "@/components/home/services-teaser";
import { CuratedCredibility } from "@/components/home/curated-credibility";
import { Testimonials } from "@/components/home/testimonials";
import { FinalCta } from "@/components/home/final-cta";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <main>
      <SiteNav transparent />
      <HeroScrollTransition
        hero={<Hero videoSrc="/videos/herovideo.mp4" posterSrc="/videos/hero-poster.jpg" />}
        pressLogoWall={<PressLogoWall />}
      />
      <Philosophy />
      <ServicesTeaser />
      <CuratedCredibility />
      <Testimonials />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
