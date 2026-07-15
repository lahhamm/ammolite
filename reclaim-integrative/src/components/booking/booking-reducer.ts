// State machine for the multi-step booking flow.
// Pure reducer so transitions are unit-testable without rendering.

import {
  getAddOnsForService,
  getServiceBySlug,
  type CategoryId,
  type LocationId,
} from "@/data/booking";

export type StepId =
  | "service"
  | "location"
  | "addons"
  | "schedule"
  | "details"
  | "review"
  | "confirmed";

export interface PatientDetails {
  name: string;
  email: string;
  phone: string;
  patientType: "new" | "returning";
  note: string;
}

export interface BookingState {
  step: StepId;
  categoryId: CategoryId | null;
  serviceSlug: string | null;
  /** Selected dosage tier label for services with variants. */
  variantLabel: string | null;
  locationId: LocationId | null;
  addOnIds: string[];
  date: string | null;
  time: string | null;
  details: PatientDetails;
}

export const INITIAL_DETAILS: PatientDetails = {
  name: "",
  email: "",
  phone: "",
  patientType: "new",
  note: "",
};

export const INITIAL_STATE: BookingState = {
  // Location-first: the two clinics are geographically far apart, so visitors
  // choose where they will physically go before browsing services.
  step: "location",
  categoryId: null,
  serviceSlug: null,
  variantLabel: null,
  locationId: null,
  addOnIds: [],
  date: null,
  time: null,
  details: INITIAL_DETAILS,
};

export type BookingAction =
  | { type: "SELECT_CATEGORY"; categoryId: CategoryId }
  | { type: "CLEAR_CATEGORY" }
  | { type: "SELECT_SERVICE"; slug: string; variantLabel?: string }
  | { type: "SELECT_VARIANT"; variantLabel: string }
  | { type: "SELECT_LOCATION"; locationId: LocationId }
  | { type: "TOGGLE_ADD_ON"; addOnId: string }
  | { type: "SELECT_DATE"; date: string }
  | { type: "SELECT_TIME"; time: string }
  | { type: "SET_DETAILS"; details: Partial<PatientDetails> }
  | { type: "GO_TO_STEP"; step: StepId }
  | { type: "CONFIRM" }
  | { type: "RESET" };

/** Ordered steps for the current selection; add-ons only when suggested.
 *  Location comes first so visitors pick a clinic before browsing services. */
export function stepsForService(serviceSlug: string | null): StepId[] {
  const hasAddOns =
    serviceSlug !== null && getAddOnsForService(serviceSlug).length > 0;
  return [
    "location",
    "service",
    ...(hasAddOns ? (["addons"] as StepId[]) : []),
    "schedule",
    "details",
    "review",
  ];
}

export function nextStep(state: BookingState): StepId {
  const steps = stepsForService(state.serviceSlug);
  const index = steps.indexOf(state.step);
  return steps[Math.min(index + 1, steps.length - 1)];
}

export function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  switch (action.type) {
    case "SELECT_CATEGORY":
      return { ...state, categoryId: action.categoryId };

    case "CLEAR_CATEGORY":
      return { ...state, categoryId: null };

    case "SELECT_SERVICE": {
      const service = getServiceBySlug(action.slug);
      if (!service) return state;
      // Location is chosen first. Keep it if the new service is offered there;
      // if a single-location service is picked without a location yet (deep
      // link), auto-select its only clinic. Reset downstream selections.
      const keepLocation =
        state.locationId !== null && service.locations.includes(state.locationId);
      const locationId = keepLocation
        ? state.locationId
        : service.locations.length === 1
          ? service.locations[0]
          : null;
      const withService: BookingState = {
        ...state,
        categoryId: service.category,
        serviceSlug: service.slug,
        variantLabel:
          action.variantLabel ?? service.variants?.[0]?.label ?? null,
        locationId,
        addOnIds: [],
        date: null,
        time: null,
      };
      // With a location known, advance past the service step; otherwise the
      // visitor still needs to pick a clinic first.
      return {
        ...withService,
        step: locationId
          ? nextStep({ ...withService, step: "service" })
          : "location",
      };
    }

    case "SELECT_VARIANT":
      return { ...state, variantLabel: action.variantLabel };

    case "SELECT_LOCATION": {
      const changed = state.locationId !== action.locationId;
      const service = state.serviceSlug
        ? getServiceBySlug(state.serviceSlug)
        : null;
      // If the currently-selected service is not offered at the new location,
      // clear it (and its add-ons) and send the visitor to the Service step.
      // Never let an invalid service+location combo persist downstream.
      const serviceInvalid =
        service !== null && !service.locations.includes(action.locationId);

      if (serviceInvalid) {
        return {
          ...state,
          locationId: action.locationId,
          serviceSlug: null,
          categoryId: null,
          variantLabel: null,
          addOnIds: [],
          date: null,
          time: null,
          step: "service",
        };
      }

      const withLocation: BookingState = {
        ...state,
        locationId: action.locationId,
        ...(changed ? { date: null, time: null } : {}),
      };
      // Advance from location. With a service already held and valid here
      // (a both-locations deep link), skip the Service step entirely and go to
      // the step after it. Otherwise land on the Service step to browse.
      if (service) {
        return {
          ...withLocation,
          step: nextStep({ ...withLocation, step: "service" }),
        };
      }
      return { ...withLocation, step: "service" };
    }

    case "TOGGLE_ADD_ON": {
      const has = state.addOnIds.includes(action.addOnId);
      return {
        ...state,
        addOnIds: has
          ? state.addOnIds.filter((id) => id !== action.addOnId)
          : [...state.addOnIds, action.addOnId],
      };
    }

    case "SELECT_DATE":
      return state.date === action.date
        ? state
        : { ...state, date: action.date, time: null };

    case "SELECT_TIME":
      return { ...state, time: action.time };

    case "SET_DETAILS":
      return { ...state, details: { ...state.details, ...action.details } };

    case "GO_TO_STEP": {
      // Only allow navigating to steps that exist for the current service.
      const steps = stepsForService(state.serviceSlug);
      if (action.step !== "confirmed" && !steps.includes(action.step)) {
        return state;
      }
      return { ...state, step: action.step };
    }

    case "CONFIRM":
      return { ...state, step: "confirmed" };

    case "RESET":
      return INITIAL_STATE;

    default:
      return state;
  }
}

/** Base price for the current selection (variant-aware). */
export function selectedBasePrice(state: BookingState): number | null {
  const service = state.serviceSlug ? getServiceBySlug(state.serviceSlug) : null;
  if (!service) return null;
  if (service.variants && state.variantLabel) {
    const variant = service.variants.find((v) => v.label === state.variantLabel);
    if (variant) return variant.price;
  }
  return service.price;
}

/**
 * Running total: base price plus selected add-ons.
 * Returns null when the base service uses membership pricing.
 */
export function selectedTotal(state: BookingState): number | null {
  const base = selectedBasePrice(state);
  if (base === null) return null;
  const addOns = state.serviceSlug ? getAddOnsForService(state.serviceSlug) : [];
  const addOnTotal = addOns
    .filter((a) => state.addOnIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  return base + addOnTotal;
}
