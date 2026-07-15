"use client";

import { useState } from "react";
import { CheckCircle, X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  getAddOnsForService,
  getLocationById,
  getServiceBySlug,
} from "@/data/booking";
import { confirmationCode, formatDateLong, formatTime } from "@/lib/availability";
import { selectedTotal, type BookingState } from "./booking-reducer";

interface ConfirmationScreenProps {
  state: BookingState;
}

export function ConfirmationScreen({ state }: ConfirmationScreenProps) {
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const service = state.serviceSlug ? getServiceBySlug(state.serviceSlug) : null;
  const location = state.locationId ? getLocationById(state.locationId) : null;
  const addOns = state.serviceSlug
    ? getAddOnsForService(state.serviceSlug).filter((a) =>
        state.addOnIds.includes(a.id),
      )
    : [];
  const total = selectedTotal(state);
  const code = confirmationCode([
    state.serviceSlug ?? "",
    state.date ?? "",
    state.time ?? "",
  ]);

  return (
    <div className="mx-auto max-w-xl text-center">
      {!noticeDismissed && (
        <div
          role="status"
          className="mb-8 flex items-center justify-between gap-3 rounded-sm border border-border bg-white px-4 py-2.5 text-left"
        >
          <p className="font-sans text-xs text-muted">
            Demo preview. No appointment has been created.
          </p>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={() => setNoticeDismissed(true)}
            className="shrink-0 text-muted transition-colors duration-200 hover:text-ink"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <CheckCircle
        size={56}
        weight="light"
        aria-hidden="true"
        className="mx-auto text-accent-sage"
      />
      <h2 className="mt-6 font-serif text-3xl text-ink">You are booked in</h2>
      <p className="mt-3 font-sans text-muted">
        Confirmation {code}. A summary is on its way to {state.details.email}.
      </p>

      <dl className="mt-10 divide-y divide-border rounded-lg border border-border bg-white text-left">
        <SummaryRow label="Service">
          {service?.name}
          {state.variantLabel && service?.variants ? `, ${state.variantLabel}` : ""}
        </SummaryRow>
        {addOns.length > 0 && (
          <SummaryRow label="Add-ons">
            {addOns.map((a) => a.name).join(", ")}
          </SummaryRow>
        )}
        <SummaryRow label="Location">
          {location?.name}
          <span className="block text-xs text-muted">{location?.address}</span>
        </SummaryRow>
        <SummaryRow label="When">
          {state.date && formatDateLong(state.date)}
          <span className="block text-xs text-muted">
            {state.time && formatTime(state.time)} Pacific Time
          </span>
        </SummaryRow>
        <SummaryRow label="Total">{formatPrice(total)}</SummaryRow>
      </dl>

      <div className="mt-10 rounded-lg bg-accent-sage/10 p-6 text-left">
        <h3 className="font-serif text-lg text-ink">What happens next</h3>
        <ul className="mt-3 flex flex-col gap-2 font-sans text-sm text-ink/80">
          <li>Intake forms will arrive by email before your visit.</li>
          <li>Please arrive 10 minutes early so we can get you settled.</li>
          <li>
            Need to reschedule? Let us know at least 24 hours ahead to avoid a
            cancellation fee.
          </li>
        </ul>
      </div>

      <div className="mt-10">
        <Button variant="primary" href="/">
          Back to home
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-8">
      <dt className="w-28 shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="flex-1 font-sans text-sm text-ink">{children}</dd>
    </div>
  );
}
