"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { formatPrice, getAddOnsForService, getServiceBySlug } from "@/data/booking";
import type { BookingAction, BookingState } from "./booking-reducer";

interface AddOnsStepProps {
  state: BookingState;
  dispatch: (action: BookingAction) => void;
}

export function AddOnsStep({ state, dispatch }: AddOnsStepProps) {
  const service = state.serviceSlug ? getServiceBySlug(state.serviceSlug) : null;
  const addOns = state.serviceSlug ? getAddOnsForService(state.serviceSlug) : [];

  return (
    <div>
      <h2 className="font-serif text-3xl text-ink">Add to your visit</h2>
      <p className="mt-3 font-sans text-muted">
        Optional pairings our team suggests with {service?.name ?? "this service"}.
        Skip this step if you only want the base treatment.
      </p>
      <ul className="mt-8 flex flex-col gap-3">
        {addOns.map((addOn) => {
          const checked = state.addOnIds.includes(addOn.id);
          return (
            <li key={addOn.id}>
              <label
                className={`flex w-full cursor-pointer items-start gap-4 rounded-lg border bg-white p-5 transition-colors duration-300 ${
                  checked ? "border-accent-sage ring-1 ring-accent-sage" : "border-border hover:border-accent-sage/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => dispatch({ type: "TOGGLE_ADD_ON", addOnId: addOn.id })}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-200 ${
                    checked ? "border-accent-sage bg-accent-sage text-white" : "border-border bg-white"
                  }`}
                >
                  {checked && <Check size={12} weight="bold" />}
                </span>
                <span className="flex-1">
                  <span className="block font-sans font-medium text-ink">{addOn.name}</span>
                  {addOn.description && (
                    <span className="mt-1 block font-sans text-sm text-muted">
                      {addOn.description}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-sans text-sm text-ink">
                  + {formatPrice(addOn.price)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-8">
        <Button
          variant="primary"
          onClick={() => dispatch({ type: "GO_TO_STEP", step: "schedule" })}
        >
          {state.addOnIds.length > 0 ? "Continue" : "Continue without add-ons"}
        </Button>
      </div>
    </div>
  );
}
