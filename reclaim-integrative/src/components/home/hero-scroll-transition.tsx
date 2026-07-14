"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";

// Register ScrollTrigger plugin only when matchMedia is available (browser environment)
if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroScrollTransitionProps {
  hero: ReactNode;
  pressLogoWall: ReactNode;
}

export function HeroScrollTransition({ hero, pressLogoWall }: HeroScrollTransitionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Guard against test environments where matchMedia is not available
    const reduce =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
    if (reduce || !heroRef.current || !wrapRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(heroRef.current, {
        scale: 0.94,
        opacity: 0.6,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef}>
      <div ref={heroRef}>{hero}</div>
      {pressLogoWall}
    </div>
  );
}
