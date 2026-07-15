"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import type { StepId } from "./booking-reducer";

const STEP_LABELS: Record<Exclude<StepId, "confirmed">, string> = {
  service: "Service",
  location: "Location",
  addons: "Add-ons",
  schedule: "Date & time",
  details: "Your details",
  review: "Review",
};

interface StepIndicatorProps {
  steps: StepId[];
  currentStep: StepId;
  onNavigate: (step: StepId) => void;
}

export function StepIndicator({ steps, currentStep, onNavigate }: StepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav aria-label="Booking progress">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {steps.map((step, index) => {
          if (step === "confirmed") return null;
          const label = STEP_LABELS[step];
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;
          return (
            <li key={step} className="flex items-center gap-1">
              {index > 0 && (
                <span aria-hidden="true" className="mx-1 h-px w-4 bg-border" />
              )}
              <button
                type="button"
                disabled={!isComplete}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => isComplete && onNavigate(step)}
                className={`flex items-center gap-1.5 rounded-sm px-1.5 py-1 font-sans text-xs tracking-wide transition-colors duration-200 ${
                  isCurrent
                    ? "font-medium text-ink"
                    : isComplete
                      ? "text-accent-sage hover:text-ink"
                      : "cursor-default text-muted/60"
                }`}
              >
                {isComplete ? (
                  <Check size={12} weight="bold" aria-hidden="true" />
                ) : (
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "bg-ink" : "bg-border"}`}
                  />
                )}
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
