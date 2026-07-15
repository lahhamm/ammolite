"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  items: { question: string; answer: string }[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className={cn("w-full flex flex-col gap-4", className)}>
      {items.map((item, index) => {
        const isActive = activeIndex === index;

        return (
          <div
            key={index}
            className={cn(
              "border border-primary/20 rounded-2xl overflow-hidden transition-colors duration-300",
              isActive ? "bg-primary/5 border-primary/40" : "bg-card hover:border-primary/40"
            )}
          >
            <button
              onClick={() => setActiveIndex(isActive ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h3 className="font-serif text-xl md:text-2xl text-foreground font-medium pr-8">
                {item.question}
              </h3>
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full border border-primary flex items-center justify-center transition-colors duration-300",
                  isActive ? "bg-primary text-primary-foreground" : "text-primary"
                )}
              >
                {isActive ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="p-6 pt-0 text-muted-foreground text-lg leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
