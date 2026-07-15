"use client";

import { MapPin } from "@phosphor-icons/react/dist/ssr";
import {
  LOCATIONS,
  getLocationsForService,
  getServiceBySlug,
} from "@/data/booking";
import type { BookingAction, BookingState } from "./booking-reducer";

interface LocationStepProps {
  state: BookingState;
  dispatch: (action: BookingAction) => void;
}

export function LocationStep({ state, dispatch }: LocationStepProps) {
  // Location comes first. With no service deep-linked, show both clinics.
  // When a service is held (deep link), scope to the clinics that offer it.
  const service = state.serviceSlug ? getServiceBySlug(state.serviceSlug) : null;
  const locations = service
    ? getLocationsForService(service.slug)
    : LOCATIONS;
  const single = locations.length === 1 ? locations[0] : null;

  const lede = service
    ? single
      ? `${service.name} is available at our ${single.name} clinic.`
      : `${service.name} is available at both clinics. Choose one to continue.`
    : "The two clinics are a distance apart, so start by choosing where you would like to be seen.";

  return (
    <div>
      <h2 className="font-serif text-3xl text-ink">Choose a clinic</h2>
      <p className="mt-3 font-sans text-muted">{lede}</p>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {locations.map((location) => {
          const isSelected = state.locationId === location.id;
          return (
            <li key={location.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  dispatch({ type: "SELECT_LOCATION", locationId: location.id })
                }
                className={`flex h-full w-full flex-col items-start gap-3 rounded-lg border bg-white p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-sage hover:shadow-lg hover:shadow-black/5 focus-visible:outline-2 focus-visible:outline-accent-sage ${
                  isSelected ? "border-accent-sage ring-1 ring-accent-sage" : "border-accent-sage/30"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-sage/10 text-accent-sage">
                  <MapPin size={20} aria-hidden="true" />
                </span>
                <span className="font-serif text-xl text-ink">{location.name}</span>
                <span className="font-sans text-sm leading-relaxed text-muted">
                  {location.address}
                </span>
                {location.phone && (
                  <span className="font-sans text-xs text-muted">{location.phone}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
