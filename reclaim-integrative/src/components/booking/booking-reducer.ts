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
  step: "service",
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

/** Ordered steps for the current selection; add-ons only when suggested. */
export function stepsForService(serviceSlug: string | null): StepId[] {
  const hasAddOns =
    serviceSlug !== null && getAddOnsForService(serviceSlug).length > 0;
  return [
    "service",
    "location",
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
      // Keep location if the new service is still offered there;
      // reset all downstream selections.
      const keepLocation =
        state.locationId !== null && service.locations.includes(state.locationId);
      const locationId = keepLocation
        ? state.locationId
        : service.locations.length === 1
          ? service.locations[0]
          : null;
      return {
        ...state,
        step: "location",
        categoryId: service.category,
        serviceSlug: service.slug,
        variantLabel:
          action.variantLabel ?? service.variants?.[0]?.label ?? null,
        locationId,
        addOnIds: [],
        date: null,
        time: null,
      };
    }

    case "SELECT_VARIANT":
      return { ...state, variantLabel: action.variantLabel };

    case "SELECT_LOCATION": {
      const changed = state.locationId !== action.locationId;
      return {
        ...state,
        locationId: action.locationId,
        step: nextStep({ ...state, step: "location" }),
        ...(changed ? { date: null, time: null } : {}),
      };
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
