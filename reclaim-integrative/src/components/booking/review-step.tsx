"use client";

import { Info } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  getAddOnsForService,
  getLocationById,
  getServiceBySlug,
} from "@/data/booking";
import { formatDateLong, formatTime } from "@/lib/availability";
import {
  selectedTotal,
  type BookingAction,
  type BookingState,
} from "./booking-reducer";

interface ReviewStepProps {
  state: BookingState;
  dispatch: (action: BookingAction) => void;
}

export function ReviewStep({ state, dispatch }: ReviewStepProps) {
  const service = state.serviceSlug ? getServiceBySlug(state.serviceSlug) : null;
  const location = state.locationId ? getLocationById(state.locationId) : null;
  const addOns = state.serviceSlug
    ? getAddOnsForService(state.serviceSlug).filter((a) =>
        state.addOnIds.includes(a.id),
      )
    : [];
  const total = selectedTotal(state);

  if (!service || !location || !state.date || !state.time) {
    return (
      <div>
        <h2 className="font-serif text-3xl text-ink">Review your booking</h2>
        <p className="mt-3 font-sans text-muted">
          Some details are missing. Use the steps above to complete your selection.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-3xl text-ink">Review your booking</h2>
      <p className="mt-3 font-sans text-muted">
        A quick look before you confirm.
      </p>

      <dl className="mt-8 divide-y divide-border rounded-lg border border-border bg-white">
        <Row label="Service">
          {service.name}
          {state.variantLabel && service.variants ? `, ${state.variantLabel}` : ""}
          <span className="block text-xs text-muted">
            {service.durationMin} min · {service.kind}
          </span>
        </Row>
        {addOns.length > 0 && (
          <Row label="Add-ons">
            {addOns.map((a) => (
              <span key={a.id} className="flex justify-between gap-4">
                {a.name}
                <span className="text-muted">{formatPrice(a.price)}</span>
              </span>
            ))}
          </Row>
        )}
        <Row label="Location">
          {location.name}
          <span className="block text-xs text-muted">{location.address}</span>
        </Row>
        <Row label="Date & time">
          {formatDateLong(state.date)}
          <span className="block text-xs text-muted">
            {formatTime(state.time)} Pacific Time
          </span>
        </Row>
        <Row label="Patient">
          {state.details.name}
          <span className="block text-xs text-muted">
            {state.details.email} · {state.details.phone} ·{" "}
            {state.details.patientType === "new" ? "New patient" : "Returning patient"}
          </span>
          {state.details.note && (
            <span className="mt-1 block text-xs text-muted">
              Note: {state.details.note}
            </span>
          )}
        </Row>
        <Row label="Total">
          <span className="font-medium">{formatPrice(total)}</span>
          {service.price === null && (
            <span className="block text-xs text-muted">
              Final pricing is confirmed with your membership plan.
            </span>
          )}
        </Row>
      </dl>

      {service.requirementNote && (
        <p className="mt-4 flex items-start gap-1.5 font-sans text-xs text-muted">
          <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-sage" />
          {service.requirementNote}
        </p>
      )}

      <div className="mt-8 flex items-center gap-4">
        <Button variant="primary" onClick={() => dispatch({ type: "CONFIRM" })}>
          Confirm booking
        </Button>
        <button
          type="button"
          onClick={() => dispatch({ type: "GO_TO_STEP", step: "details" })}
          className="font-sans text-sm text-muted underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 p-5 sm:flex-row sm:gap-8">
      <dt className="w-32 shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="flex-1 font-sans text-sm text-ink">{children}</dd>
    </div>
  );
}
