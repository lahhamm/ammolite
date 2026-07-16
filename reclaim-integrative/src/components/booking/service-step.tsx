"use client";

import { useState } from "react";
import {
  CaretDown,
  CaretLeft,
  ChatCircleText,
  Drop,
  Flask,
  Heartbeat,
  Info,
  Syringe,
} from "@phosphor-icons/react/dist/ssr";
import {
  CATEGORIES,
  LOCATIONS,
  formatPrice,
  getServicesByCategory,
  type BookingService,
  type CategoryId,
} from "@/data/booking";
import type { BookingAction, BookingState } from "./booking-reducer";

const CATEGORY_ICONS: Record<CategoryId, typeof Drop> = {
  "blood-draw": Flask,
  consultations: ChatCircleText,
  "im-shots": Syringe,
  "iv-therapy": Drop,
  eboo: Heartbeat,
};

interface ServiceStepProps {
  state: BookingState;
  dispatch: (action: BookingAction) => void;
}

export function ServiceStep({ state, dispatch }: ServiceStepProps) {
  // Location is chosen first, so every listing is scoped to that clinic.
  const locationId = state.locationId ?? undefined;
  const locationName = state.locationId
    ? LOCATIONS.find((l) => l.id === state.locationId)?.name
    : null;

  if (state.categoryId === null) {
    // Only show categories that offer at least one service at this clinic.
    const availableCategories = CATEGORIES.filter(
      (category) => getServicesByCategory(category.id, locationId).length > 0,
    );
    return (
      <div>
        <h2 className="font-serif text-3xl text-ink">What brings you in?</h2>
        <p className="mt-3 font-sans text-muted">
          {locationName
            ? `Choose a type of care available at our ${locationName} clinic.`
            : "Choose a type of care to see available services."}
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {availableCategories.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const count = getServicesByCategory(category.id, locationId).length;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SELECT_CATEGORY", categoryId: category.id })
                  }
                  className="group flex h-full w-full flex-col items-start gap-3 rounded-lg border border-accent-sage/30 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-sage hover:shadow-lg hover:shadow-black/5 focus-visible:outline-2 focus-visible:outline-accent-sage"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-sage/10 text-accent-sage transition-colors duration-300 group-hover:bg-accent-sage group-hover:text-white">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="font-serif text-xl text-ink">{category.name}</span>
                  <span className="font-sans text-sm text-muted">{category.description}</span>
                  <span className="font-sans text-xs tracking-wide text-accent-sage">
                    {count} {count === 1 ? "service" : "services"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === state.categoryId);
  const services = getServicesByCategory(state.categoryId, locationId);

  return (
    <div>
      <button
        type="button"
        onClick={() => dispatch({ type: "CLEAR_CATEGORY" })}
        className="mb-6 inline-flex items-center gap-1.5 font-sans text-sm text-muted transition-colors duration-200 hover:text-ink"
      >
        <CaretLeft size={14} aria-hidden="true" />
        All categories
      </button>
      <h2 className="font-serif text-3xl text-ink">{category?.name}</h2>
      <p className="mt-3 font-sans text-muted">Select a service to continue.</p>
      <ul className="mt-8 flex flex-col gap-3">
        {services.map((service) => (
          <ServiceRow
            key={service.slug}
            service={service}
            selected={state.serviceSlug === service.slug}
            variantLabel={state.variantLabel}
            dispatch={dispatch}
          />
        ))}
      </ul>
    </div>
  );
}

function ServiceRow({
  service,
  selected,
  variantLabel,
  dispatch,
}: {
  service: BookingService;
  selected: boolean;
  variantLabel: string | null;
  dispatch: (action: BookingAction) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingVariant, setPendingVariant] = useState(
    service.variants?.[0]?.label ?? null,
  );
  const displayVariant = selected ? variantLabel : pendingVariant;
  const displayPrice = service.variants
    ? (service.variants.find((v) => v.label === displayVariant)?.price ??
      service.price)
    : service.price;

  return (
    <li
      className={`relative rounded-lg border bg-white p-5 transition-all duration-300 ${
        selected
          ? "border-accent-sage ring-1 ring-accent-sage"
          : "border-border hover:-translate-y-0.5 hover:border-accent-sage hover:shadow-lg hover:shadow-black/5"
      }`}
    >
      {/* Stretched hit area: after:inset-0 anchors to the li, so a click
          anywhere on the card selects the service. Dosage and Details sit
          above it (relative z-10) and stay independently clickable. */}
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: "SELECT_SERVICE",
            slug: service.slug,
            variantLabel: pendingVariant ?? undefined,
          })
        }
        className="flex w-full cursor-pointer items-baseline justify-between gap-4 text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-accent-sage"
      >
        <span>
          <span className="block font-sans font-medium text-ink">{service.name}</span>
          <span className="mt-1 block font-sans text-xs tracking-wide text-muted">
            {service.durationMin} min · {service.kind}
          </span>
        </span>
        <span className="shrink-0 font-sans text-sm text-ink">
          {formatPrice(displayPrice)}
        </span>
      </button>

      {service.variants && (
        <div className="relative z-10 mt-3">
          <label
            htmlFor={`variant-${service.slug}`}
            className="block font-sans text-xs font-medium text-muted"
          >
            Dosage
          </label>
          <select
            id={`variant-${service.slug}`}
            value={displayVariant ?? ""}
            onChange={(e) => {
              setPendingVariant(e.target.value);
              if (selected) {
                dispatch({ type: "SELECT_VARIANT", variantLabel: e.target.value });
              }
            }}
            className="mt-1 rounded-sm border border-border bg-white px-3 py-2 font-sans text-sm text-ink focus:border-accent-sage focus:outline-none"
          >
            {service.variants.map((variant) => (
              <option key={variant.label} value={variant.label}>
                {variant.label} ({formatPrice(variant.price)})
              </option>
            ))}
          </select>
        </div>
      )}

      {service.requirementNote && (
        <p className="mt-3 flex items-start gap-1.5 font-sans text-xs text-muted">
          <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-sage" />
          {service.requirementNote}
        </p>
      )}

      {service.description && (
        <div className="relative z-10 mt-3">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex cursor-pointer items-center gap-1 font-sans text-xs font-medium text-accent-sage transition-colors duration-200 hover:text-ink"
          >
            Details
            <CaretDown
              size={12}
              aria-hidden="true"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          {expanded && (
            <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
              {service.description}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
