"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-canvas"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-8 rounded-[32px] border border-border bg-white shadow-sm max-w-sm w-full" key={i}>
                  <div className="font-sans text-sm text-ink/80">{text}</div>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0">
                      <Image
                        fill
                        src={image}
                        alt={name}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-serif text-sm font-medium tracking-tight text-ink">{name}</div>
                      <div className="text-xs text-ink/60">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
