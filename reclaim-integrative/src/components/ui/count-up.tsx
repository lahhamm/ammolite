"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface CountUpProps {
  target: string; // e.g. "3B+", "117M+", "11+"
  duration?: number;
}

function parseTarget(target: string): { num: number; suffix: string } {
  const match = target.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: 0, suffix: target };
  return { num: parseFloat(match[1]), suffix: match[2] };
}

export function CountUp({ target, duration = 2 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState("0");
  const { num, suffix } = parseTarget(target);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    const durationMs = duration * 1000;

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * num;

      if (Number.isInteger(num)) {
        setDisplay(Math.round(current) + suffix);
      } else {
        setDisplay(current.toFixed(1) + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplay(target);
      }
    }

    requestAnimationFrame(update);
  }, [isInView, num, suffix, target, duration]);

  return <span ref={ref}>{display}</span>;
}
