"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "motion/react";

interface HeroProps {
  videoSrc?: string;
  posterSrc?: string;
}

export function Hero({ videoSrc, posterSrc }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex flex-col justify-end overflow-hidden">
      <motion.div 
        data-testid="hero-background" 
        className="absolute w-full h-[130%] -top-[15%] left-0 origin-center will-change-transform"
        style={{ y }}
      >
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
          ) : posterSrc ? (
            <Image
              data-testid="hero-poster"
              src={posterSrc}
              alt="Aerial view of the Newport Beach coastline"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/40 to-ink/20 pointer-events-none" />

      <div className="relative w-[88%] mx-auto px-4 md:px-8 pb-16 md:pb-24">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl md:text-6xl leading-tight text-white drop-shadow-lg">
            Root-cause care, in Newport Beach.
          </h1>
          <p className="mt-4 text-white/90 max-w-md text-lg drop-shadow-md">
            Personalized naturopathic and integrative medicine for hormones, gut
            health, and lasting energy.
          </p>
        </div>
      </div>
    </section>
  );
}
