import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/layout/site-nav";

interface HeroProps {
  videoSrc?: string;
  posterSrc: string;
}

export function Hero({ videoSrc, posterSrc }: HeroProps) {
  return (
    <section className="relative min-h-[100dvh] flex flex-col">
      <SiteNav transparent />

      <div className="absolute inset-0">
        {videoSrc ? (
          <video
            data-testid="hero-video"
            className="w-full h-full object-cover"
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Image
            data-testid="hero-poster"
            src={posterSrc}
            alt="Aerial view of the Newport Beach coastline"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
      </div>

      <div className="relative mt-auto px-6 md:px-10 pb-16 md:pb-24 max-w-2xl">
        <h1 className="font-serif text-4xl md:text-6xl leading-tight text-canvas">
          Root-cause care, in Newport Beach.
        </h1>
        <p className="mt-4 text-canvas/90 max-w-md">
          Personalized naturopathic and integrative medicine for hormones, gut
          health, and lasting energy.
        </p>
        <div className="mt-8 flex items-center gap-6">
          <Button variant="gold">Schedule Consultation</Button>
          <Button variant="text" className="text-canvas">
            (949) 423-3522
          </Button>
        </div>
      </div>
    </section>
  );
}
