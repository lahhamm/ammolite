"use client";

import { useState } from "react";
import { CaretUp } from "@phosphor-icons/react/dist/ssr";
import {
  formatPrice,
  getAddOnsForService,
  getLocationById,
  getServiceBySlug,
} from "@/data/booking";
import { formatDateLabel, formatTime } from "@/lib/availability";
import { selectedTotal, type BookingState } from "./booking-reducer";

interface BookingSummaryProps {
  state: BookingState;
}

function SummaryBody({ state }: { state: BookingState }) {
  const service = state.serviceSlug ? getServiceBySlug(state.serviceSlug) : null;
  const location = state.locationId ? getLocationById(state.locationId) : null;
  const addOns = state.serviceSlug
    ? getAddOnsForService(state.serviceSlug).filter((a) =>
        state.addOnIds.includes(a.id),
      )
    : [];
  const total = selectedTotal(state);

  if (!service) {
    return (
      <p className="font-sans text-sm text-muted">
        Your selections will appear here as you go.
      </p>
    );
  }

  return (
    <dl className="flex flex-col gap-3 font-sans text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Service</dt>
        <dd className="text-right text-ink">
          {service.name}
          {state.variantLabel && service.variants ? `, ${state.variantLabel}` : ""}
        </dd>
      </div>
      {location && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Location</dt>
          <dd className="text-right text-ink">{location.name}</dd>
        </div>
      )}
      {addOns.map((addOn) => (
        <div key={addOn.id} className="flex justify-between gap-4">
          <dt className="text-muted">{addOn.name}</dt>
          <dd className="text-right text-ink">{formatPrice(addOn.price)}</dd>
        </div>
      ))}
      {state.date && state.time && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted">When</dt>
          <dd className="text-right text-ink">
            {formatDateLabel(state.date)}, {formatTime(state.time)}
          </dd>
        </div>
      )}
      <div className="mt-1 flex justify-between gap-4 border-t border-border pt-3">
        <dt className="font-medium text-ink">Total</dt>
        <dd className="text-right font-medium text-ink">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

export function BookingSummary({ state }: BookingSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const service = state.serviceSlug ? getServiceBySlug(state.serviceSlug) : null;
  const total = selectedTotal(state);

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside
        aria-label="Booking summary"
        className="hidden w-80 shrink-0 lg:block"
      >
        <div className="sticky top-24 rounded-lg border border-border bg-white p-6">
          <h2 className="font-serif text-lg text-ink">Your booking</h2>
          <div className="mt-4">
            <SummaryBody state={state} />
          </div>
        </div>
      </aside>

      {/* Mobile: collapsible sticky bottom bar */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-border bg-canvas/95 backdrop-blur-md lg:hidden">
        {expanded && (
          <div className="border-b border-border px-6 py-4">
            <SummaryBody state={state} />
          </div>
        )}
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-between gap-4 px-6 py-4"
        >
          <span className="truncate text-left font-sans text-sm text-ink">
            {service ? service.name : "Your booking"}
          </span>
          <span className="flex shrink-0 items-center gap-2 font-sans text-sm font-medium text-ink">
            {service ? formatPrice(total) : ""}
            <CaretUp
              size={14}
              aria-hidden="true"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      </div>
    </>
  );
}
