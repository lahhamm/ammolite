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
  it("advances to location and stores category when a service is selected", () => {
    const state = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "iv-myers-cocktail" });
    expect(state.step).toBe("location");
    expect(state.serviceSlug).toBe("iv-myers-cocktail");
    expect(state.categoryId).toBe("iv-therapy");
  });

  it("ignores unknown service slugs", () => {
    const state = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "nonsense" });
    expect(state).toEqual(INITIAL_STATE);
  });

  it("auto-selects the location for single-location services", () => {
    const state = reduce(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "eboo" });
    expect(state.locationId).toBe("newport-beach");
  });

  it("keeps a still-valid location when changing service, resets downstream", () => {
    const booked = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "iv-myers-cocktail" },
      { type: "SELECT_LOCATION", locationId: "rancho-cucamonga" },
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

  it("drops a location the new service does not offer", () => {
    const booked = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "blood-draw" },
      { type: "SELECT_LOCATION", locationId: "newport-beach" },
    );
    const switched = reduce(booked, { type: "SELECT_SERVICE", slug: "b12-vitamin-shot" });
    // B12 shot is Rancho-only, so the Newport selection cannot survive;
    // single-location services auto-select their only clinic.
    expect(switched.locationId).toBe("rancho-cucamonga");
  });

  it("skips the add-ons step for services without suggestions", () => {
    expect(stepsForService("blood-draw")).toEqual([
      "service",
      "location",
      "schedule",
      "details",
      "review",
    ]);
    expect(stepsForService("iv-myers-cocktail")).toEqual([
      "service",
      "location",
      "addons",
      "schedule",
      "details",
      "review",
    ]);
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "blood-draw" },
      { type: "SELECT_LOCATION", locationId: "newport-beach" },
    );
    expect(state.step).toBe("schedule");
  });

  it("routes to add-ons after location for IV services with suggestions", () => {
    const state = reduce(
      INITIAL_STATE,
      { type: "SELECT_SERVICE", slug: "iv-hangover" },
      { type: "SELECT_LOCATION", locationId: "newport-beach" },
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
