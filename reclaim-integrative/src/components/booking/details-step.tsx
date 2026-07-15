"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookingAction, BookingState } from "./booking-reducer";

interface DetailsStepProps {
  state: BookingState;
  dispatch: (action: BookingAction) => void;
}

type FieldErrors = Partial<Record<"name" | "email" | "phone", string>>;

function validate(details: BookingState["details"]): FieldErrors {
  const errors: FieldErrors = {};
  if (!details.name.trim()) errors.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (details.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Please enter a 10 digit phone number.";
  }
  return errors;
}

const inputClasses =
  "w-full rounded-sm border bg-white px-3 py-2.5 font-sans text-sm text-ink transition-colors duration-200 focus:border-accent-sage focus:outline-none";

export function DetailsStep({ state, dispatch }: DetailsStepProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const { details } = state;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      dispatch({ type: "GO_TO_STEP", step: "review" });
    }
  };

  return (
    <div>
      <h2 className="font-serif text-3xl text-ink">Your details</h2>
      <p className="mt-3 font-sans text-muted">
        We use these to prepare your visit and send intake forms.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-8 flex max-w-md flex-col gap-5">
        <div>
          <label htmlFor="booking-name" className="mb-1.5 block font-sans text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="booking-name"
            type="text"
            autoComplete="name"
            required
            value={details.name}
            onChange={(e) => dispatch({ type: "SET_DETAILS", details: { name: e.target.value } })}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "booking-name-error" : undefined}
            className={`${inputClasses} ${errors.name ? "border-red-700" : "border-border"}`}
          />
          {errors.name && (
            <p id="booking-name-error" role="alert" className="mt-1.5 font-sans text-xs text-red-700">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="booking-email" className="mb-1.5 block font-sans text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="booking-email"
            type="email"
            autoComplete="email"
            required
            value={details.email}
            onChange={(e) => dispatch({ type: "SET_DETAILS", details: { email: e.target.value } })}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "booking-email-error" : undefined}
            className={`${inputClasses} ${errors.email ? "border-red-700" : "border-border"}`}
          />
          {errors.email && (
            <p id="booking-email-error" role="alert" className="mt-1.5 font-sans text-xs text-red-700">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="booking-phone" className="mb-1.5 block font-sans text-sm font-medium text-ink">
            Phone
          </label>
          <input
            id="booking-phone"
            type="tel"
            autoComplete="tel"
            required
            value={details.phone}
            onChange={(e) => dispatch({ type: "SET_DETAILS", details: { phone: e.target.value } })}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "booking-phone-error" : undefined}
            className={`${inputClasses} ${errors.phone ? "border-red-700" : "border-border"}`}
          />
          {errors.phone && (
            <p id="booking-phone-error" role="alert" className="mt-1.5 font-sans text-xs text-red-700">
              {errors.phone}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="mb-2 font-sans text-sm font-medium text-ink">
            Have you visited us before?
          </legend>
          <div className="flex gap-3">
            {(
              [
                { value: "new", label: "New patient" },
                { value: "returning", label: "Returning patient" },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2.5 font-sans text-sm transition-colors duration-200 ${
                  details.patientType === option.value
                    ? "border-accent-sage bg-accent-sage/10 text-ink"
                    : "border-border bg-white text-muted hover:border-accent-sage/60"
                }`}
              >
                <input
                  type="radio"
                  name="patientType"
                  value={option.value}
                  checked={details.patientType === option.value}
                  onChange={() =>
                    dispatch({ type: "SET_DETAILS", details: { patientType: option.value } })
                  }
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="booking-note" className="mb-1.5 block font-sans text-sm font-medium text-ink">
            Anything we should know? <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="booking-note"
            rows={3}
            value={details.note}
            onChange={(e) => dispatch({ type: "SET_DETAILS", details: { note: e.target.value } })}
            className={`${inputClasses} resize-none border-border`}
          />
        </div>

        <div>
          <Button variant="primary" type="submit">
            Review booking
          </Button>
        </div>
      </form>
    </div>
  );
}
