import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WatchFace from "./WatchFace";
import MovementFace from "./MovementFace";
import "./MovementScroll.css";

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  "Every gear, hand-bevelled.",
  "28 jewels. Zero compromise.",
  "A rotor that never stops giving.",
];

export default function MovementScroll() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !section.current) return;

    const ctx = gsap.context(() => {
      gsap.to(".movement-rotor", {
        rotate: 360,
        duration: 6,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=200%",
          scrub: 1,
          pin: true,
        },
      });

      tl.to(".flip-inner", { rotateY: 180, ease: "none" }, 0)
        .to(".dial-label", { opacity: 0, duration: 0.15 }, 0)
        .to(".movement-label", { opacity: 1, duration: 0.15 }, 0.05);

      const segments = [
        { in: 0.08, out: 0.26 },
        { in: 0.36, out: 0.54 },
        { in: 0.64, out: null },
      ];
      segments.forEach(({ in: inAt, out: outAt }, i) => {
        tl.fromTo(
          `.movement-line-${i}`,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.1 },
          inAt
        );
        if (outAt !== null) {
          tl.to(`.movement-line-${i}`, { opacity: 0, y: -24, duration: 0.1 }, outAt);
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="movement" ref={section}>
      <div className="movement-copy">
        <span className="movement-eyebrow dial-label">THE DIAL</span>
        <span className="movement-eyebrow movement-label" style={{ opacity: 0 }}>
          THE MOVEMENT
        </span>
        {LINES.map((line, i) => (
          <h2 key={line} className={`movement-line movement-line-${i}`} style={{ opacity: 0 }}>
            {line}
          </h2>
        ))}
      </div>

      <div className="flip-stage">
        <div className="flip-inner">
          <div className="flip-face flip-front">
            <WatchFace />
          </div>
          <div className="flip-face flip-back">
            <MovementFace />
          </div>
        </div>
      </div>
    </section>
  );
}
