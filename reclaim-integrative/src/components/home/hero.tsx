"use client";

import { useState } from "react";
import Image from "next/image";
import { Leaf } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

/**
 * Hero image: drop the real asset at `public/images/hero.png` and it renders
 * automatically. Until the file exists, a quiet stone/sage placeholder box is
 * shown instead (the Image onError falls back to it).
 */
const HERO_IMAGE_SRC = "/images/hero.png";

export function Hero() {
  const [imageAvailable, setImageAvailable] = useState(true);

  return (
    <section className="bg-canvas">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center md:gap-14 md:px-10 md:py-20">
        <div>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl">
            Root-cause care, in Newport Beach.
          </h1>
          <p className="mt-4 max-w-md font-sans text-lg text-muted">
            Personalized naturopathic and integrative medicine for hormones,
            gut health, and lasting energy.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Button variant="gold" href="/book">
              Book an Appointment
            </Button>
            <a
              href="tel:+19494233522"
              className="py-2 font-sans text-ink underline-offset-4 transition-colors duration-200 hover:underline"
            >
              (949) 423-3522
            </a>
          </div>
        </div>

        <div
          data-testid="hero-image-box"
          className="relative h-64 w-full overflow-hidden rounded-2xl border border-accent-sage/30 bg-accent-sage/10 md:h-auto md:aspect-[4/5]"
        >
          {imageAvailable ? (
            <Image
              src={HERO_IMAGE_SRC}
              alt="The calm, coastal interior of the Reclaim Integrative clinic"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              onError={() => setImageAvailable(false)}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center"
            >
              <Leaf size={40} weight="light" className="text-accent-sage/60" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
