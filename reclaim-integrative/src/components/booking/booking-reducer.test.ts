import { describe, expect, it } from "vitest";
import {
  INITIAL_STATE,
  bookingReducer,
  selectedBasePrice,
  selectedTotal,
  stepsForService,
  type BookingState,
} from "./booking-reducer";

function reduce(state: BookingState, ...actions: Parameters<typeof bookingReducer>[1][]) {
  return actions.reduce(bookingReducer, state);
}

describe("bookingReducer", () => {
  it("starts on the Location step (clinics are far apart, choose one first)", () => {
    expect(INITIAL_STATE.step).toBe("location");
  });

  it("holds a both-locations service but stays on Location until a clinic is picked", () => {
    const state = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "iv-myers-cocktail" });
    expect(state.step).toBe("location");
    expect(state.serviceSlug).toBe("iv-myers-cocktail");
    expect(state.categoryId).toBe("iv-therapy");
    expect(state.locationId).toBeNull();
  });

  it("ignores unknown service slugs", () => {
    const state = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "nonsense" });
    expect(state).toEqual(INITIAL_STATE);
  });

  it("auto-selects the clinic and advances past Service for single-location services", () => {
    // EBOO is Newport-only: picking it (deep link) sets the location and, since
    // it has no add-ons, lands straight on the schedule step.
    const state = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "eboo" });
    expect(state.locationId).toBe("newport-beach");
    expect(state.step).toBe("schedule");
  });

  it("keeps a still-valid location when changing service, resets downstream", () => {
    const booked = reduce(
      INITIAL_STATE,
      { type: "SELECT_LOCATION", locationId: "rancho-cucamonga" },
      { type: "SELECT_SERVICE", slug: "iv-myers-cocktail" },
      { type: "TOGGLE_ADD_ON", addOnId: "glut-push" },
      { type: "SELECT_DATE", date: "2026-07-20" },
      { type: "SELECT_TIME", time: "10:00" },
    );
    const switched = reduce(booked, { type: "SELECT_SERVICE", slug: "iv-hangover" });
    expect(switched.locationId).toBe("rancho-cucamonga"); // still offered there
    expect(switched.addOnIds).toEqual([]);
    expect(switched.date).toBeNull();
    expect(switched.time).toBeNull();
  });

  it("advances past Service when the held location already offers the picked service", () => {
    // Location chosen first, then a both-locations IV service with add-ons:
    // the reducer should route straight to the add-ons step.
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_LOCATION", locationId: "newport-beach" },
      { type: "SELECT_SERVICE", slug: "iv-hangover" },
    );
    expect(state.step).toBe("addons");
  });

  it("skips the Service step after location when a both-locations service is held", () => {
    // Deep link holds the service on the Location step; picking a clinic that
    // offers it steps past Service to the next relevant step.
    const held = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "iv-hangover" });
    expect(held.step).toBe("location");
    const picked = reduce(held, { type: "SELECT_LOCATION", locationId: "rancho-cucamonga" });
    expect(picked.locationId).toBe("rancho-cucamonga");
    expect(picked.step).toBe("addons"); // IV Hangover has add-ons
  });

  it("clears the service when a location is chosen that does not offer it (back-nav invalidation)", () => {
    // Book B12 (Rancho-only) end to end, then go back and switch to Newport.
    const booked = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "b12-vitamin-shot" }, // auto-selects Rancho
      { type: "SELECT_DATE", date: "2026-07-20" },
      { type: "SELECT_TIME", time: "10:00" },
    );
    expect(booked.locationId).toBe("rancho-cucamonga");
    const switched = reduce(booked, { type: "SELECT_LOCATION", locationId: "newport-beach" });
    expect(switched.locationId).toBe("newport-beach");
    expect(switched.serviceSlug).toBeNull();
    expect(switched.categoryId).toBeNull();
    expect(switched.addOnIds).toEqual([]);
    expect(switched.date).toBeNull();
    expect(switched.time).toBeNull();
    expect(switched.step).toBe("service");
  });

  it("keeps a service valid at both clinics when the location is changed", () => {
    const booked = reduce(
      INITIAL_STATE,
      { type: "SELECT_LOCATION", locationId: "newport-beach" },
      { type: "SELECT_SERVICE", slug: "iv-myers-cocktail" }, // both locations
    );
    const switched = reduce(booked, { type: "SELECT_LOCATION", locationId: "rancho-cucamonga" });
    expect(switched.serviceSlug).toBe("iv-myers-cocktail");
    expect(switched.locationId).toBe("rancho-cucamonga");
  });

  it("orders steps location-first and skips add-ons for services without suggestions", () => {
    expect(stepsForService("blood-draw")).toEqual([
      "location",
      "service",
      "schedule",
      "details",
      "review",
    ]);
    expect(stepsForService("iv-myers-cocktail")).toEqual([
      "location",
      "service",
      "addons",
      "schedule",
      "details",
      "review",
    ]);
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_LOCATION", locationId: "newport-beach" },
      { type: "SELECT_SERVICE", slug: "blood-draw" },
    );
    expect(state.step).toBe("schedule");
  });

  it("routes to add-ons after service for IV services with suggestions", () => {
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_LOCATION", locationId: "newport-beach" },
      { type: "SELECT_SERVICE", slug: "iv-hangover" },
    );
    expect(state.step).toBe("addons");
  });

  it("toggles add-ons on and off", () => {
    const on = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "iv-hangover" },
      { type: "TOGGLE_ADD_ON", addOnId: "b12-addon" },
    );
    expect(on.addOnIds).toEqual(["b12-addon"]);
    const off = reduce(on, { type: "TOGGLE_ADD_ON", addOnId: "b12-addon" });
    expect(off.addOnIds).toEqual([]);
  });

  it("clears the chosen time when the date changes", () => {
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "blood-draw" },
      { type: "SELECT_DATE", date: "2026-07-20" },
      { type: "SELECT_TIME", time: "09:30" },
      { type: "SELECT_DATE", date: "2026-07-21" },
    );
    expect(state.time).toBeNull();
  });

  it("refuses navigation to steps not in the current flow", () => {
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "blood-draw" },
      { type: "GO_TO_STEP", step: "addons" },
    );
    expect(state.step).toBe("location");
  });

  it("resets to the initial state", () => {
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "eboo" },
      { type: "RESET" },
    );
    expect(state).toEqual(INITIAL_STATE);
  });
});

describe("pricing selectors", () => {
  it("computes base price from the selected variant", () => {
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "iv-vitamin-c" },
      { type: "SELECT_VARIANT", variantLabel: "50g" },
    );
    expect(selectedBasePrice(state)).toBe(240);
  });

  it("defaults variant services to their first tier", () => {
    const state = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "iv-vitamin-c" });
    expect(state.variantLabel).toBe("25g");
    expect(selectedBasePrice(state)).toBe(180);
  });

  it("adds selected add-on prices to the running total", () => {
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "iv-myers-cocktail" },
      { type: "TOGGLE_ADD_ON", addOnId: "glut-push" },
      { type: "TOGGLE_ADD_ON", addOnId: "iv-nad-250-addon" },
    );
    expect(selectedTotal(state)).toBe(160 + 50 + 300);
  });

  it("returns null total for membership-priced services, never 0", () => {
    const state = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "trt-injection" });
    expect(selectedTotal(state)).toBeNull();
  });
});
