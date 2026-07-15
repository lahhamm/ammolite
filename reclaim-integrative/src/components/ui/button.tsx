"use client";

import type { MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "motion/react";

type ButtonVariant = "primary" | "gold" | "inverse" | "text";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant: ButtonVariant;
  children: ReactNode;
  /** When provided, renders as a Next.js Link styled identically. */
  href?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-ink/85",
  gold: "bg-accent-gold text-ink px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-accent-gold/85",
  inverse:
    "bg-transparent text-canvas border border-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-canvas/10",
  text: "text-ink underline-offset-4 hover:underline transition-colors duration-200",
};

const MotionLink = motion.create(Link);

export function Button({ variant, children, className, href, onClick, ...props }: ButtonProps) {
  const classes = `${VARIANT_CLASSES[variant]} ${className ?? ""}`.trim();
  const interaction = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } };

  if (href) {
    return (
      <MotionLink
        href={href}
        {...interaction}
        className={`inline-block text-center ${classes}`}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button {...interaction} className={classes} onClick={onClick} {...props}>
      {children}
    </motion.button>
  );
}
