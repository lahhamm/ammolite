"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  speed?: number;
}

export function Marquee({
  children,
  pauseOnHover = false,
  direction = "left",
  speed = 30,
  className,
  ...props
}: MarqueeProps) {
  const animationName = direction === "right" ? "marquee-reverse" : "marquee";

  return (
    <div
      className={cn("w-full overflow-hidden", className)}
      {...props}
    >
      <div className="relative flex max-w-[100vw] overflow-hidden py-5">
        <div
          className={cn(
            "flex w-max items-center shrink-0",
            pauseOnHover && "hover:[animation-play-state:paused]"
          )}
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
          }}
        >
          {children}
          {children}
        </div>
      </div>
    </div>
  );
}
