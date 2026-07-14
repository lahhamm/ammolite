import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "gold" | "inverse" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-ink/85",
  gold: "bg-accent-gold text-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-accent-gold/85",
  inverse:
    "bg-transparent text-canvas border border-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-canvas/10",
  text: "text-ink underline-offset-4 hover:underline transition-colors duration-200",
};

export function Button({ variant, children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`${VARIANT_CLASSES[variant]} ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
