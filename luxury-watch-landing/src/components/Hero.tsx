import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import WatchFace from "./WatchFace";
import "./Hero.css";

gsap.registerPlugin(SplitText);

const PARTICLES = Array.from({ length: 7 }, (_, i) => i);

export default function Hero() {
  const line1Ref = useRef<HTMLSpanElement>(null);
  const echoWordRef = useRef<HTMLDivElement>(null);
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      { reduceMotion: "(prefers-reduced-motion: reduce)" },
      (context) => {
        const { reduceMotion } = context.conditions as { reduceMotion: boolean };

        if (!scope.current) return;

        if (reduceMotion) {
          gsap.set(".hero-fade-in, .hero-watch, .echo-solid, .echo-ghost, .echo-particle", {
            opacity: 1,
            clearProps: "transform,filter",
          });
          return;
        }

        const ctx = gsap.context(() => {
          if (!line1Ref.current || !echoWordRef.current) return;

          const solidSplit = new SplitText(line1Ref.current, { type: "chars" });
          const echoSolid = echoWordRef.current.querySelector(".echo-solid");
          const echoGhost = echoWordRef.current.querySelector(".echo-ghost");
          const echoSplit = new SplitText(echoSolid, { type: "chars" });

          gsap.set(".hero-watch", { opacity: 0, scale: 0.92, filter: "blur(12px)" });
          gsap.set(echoGhost, { opacity: 0, scale: 1.18, x: -26, y: -30 });
          gsap.set(".echo-particle", { opacity: 0, scale: 0.4 });

          const tl = gsap.timeline({ delay: 0.3 });

          tl.from(solidSplit.chars, {
            yPercent: 120,
            opacity: 0,
            filter: "blur(6px)",
            stagger: 0.025,
            duration: 1.1,
            ease: "power4.out",
          })
            .to(
              echoGhost,
              {
                opacity: 0.24,
                scale: 1.04,
                x: -12,
                y: -16,
                duration: 1.6,
                ease: "power3.out",
              },
              "-=0.9"
            )
            .from(
              echoSplit.chars,
              {
                yPercent: 120,
                opacity: 0,
                filter: "blur(6px)",
                stagger: 0.025,
                duration: 1.1,
                ease: "power4.out",
              },
              "-=1.5"
            )
            .to(
              ".echo-particle",
              {
                opacity: 0.5,
                scale: 1,
                stagger: 0.06,
                duration: 0.8,
                ease: "power2.out",
              },
              "-=0.9"
            )
            .to(
              ".hero-watch",
              { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.4, ease: "power3.out" },
              "-=1.1"
            )
            .from(
              ".hero-fade-in",
              { opacity: 0, y: 16, stagger: 0.12, duration: 0.9, ease: "power2.out" },
              "-=0.9"
            )
            .to(
              ".echo-particle",
              {
                y: "-=10",
                duration: 3.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: { each: 0.3, from: "random" },
              },
              "-=0.2"
            );
        }, scope);

        return () => ctx.revert();
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section className="hero" ref={scope}>
      <div className="hero-grain" />
      <header className="hero-top hero-fade-in">
        <span className="hero-brand">AUREL</span>
        <span className="hero-nav">NO. 002 — THE SOVEREIGN</span>
      </header>

      <div className="hero-body">
        <div className="hero-left">
          <h1 className="hero-headline">
            <span className="line-solid" ref={line1Ref}>
              Precision,
            </span>
            <div className="echo-word" ref={echoWordRef}>
              <span className="echo-ghost" aria-hidden="true">
                Immortalized.
              </span>
              {PARTICLES.map((i) => (
                <span key={i} className={`echo-particle echo-particle-${i}`} aria-hidden="true" />
              ))}
              <span className="echo-solid">Immortalized.</span>
            </div>
          </h1>

          <div className="hero-side hero-fade-in">
            <p className="hero-copy">
              A hand-finished automatic movement, chronometer-certified and
              warranted for a lifetime. Built to be handed down, not sold on.
            </p>
            <motion.button
              className="hero-cta"
              whileHover={{ scale: 1.04, backgroundColor: "var(--oxblood)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              Discover The Sovereign
            </motion.button>
          </div>
        </div>

        <div className="hero-watch">
          <WatchFace />
        </div>
      </div>

      <div className="hero-scroll-cue hero-fade-in">
        <span />
        SCROLL
      </div>
    </section>
  );
}
