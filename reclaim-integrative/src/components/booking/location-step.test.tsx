import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocationStep } from "./location-step";
import { INITIAL_STATE, bookingReducer } from "./booking-reducer";

describe("LocationStep", () => {
  it("shows both clinics for dual-location services", () => {
    const state = bookingReducer(INITIAL_STATE, {
      type: "SELECT_SERVICE",
      slug: "blood-draw",
    });
    render(<LocationStep state={state} dispatch={() => {}} />);
    expect(screen.getByRole("button", { name: /Newport Beach/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rancho Cucamonga/ })).toBeInTheDocument();
  });

  it("never shows a disabled dead-end clinic for single-location services", () => {
    const state = bookingReducer(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "eboo" });
    render(<LocationStep state={state} dispatch={() => {}} />);
    expect(screen.getByRole("button", { name: /Newport Beach/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rancho Cucamonga/ })).not.toBeInTheDocument();
    expect(
      screen.getByText("EBOO is available at our Newport Beach clinic."),
    ).toBeInTheDocument();
  });

  it("pre-selects the only clinic for single-location services", () => {
    const state = bookingReducer(INITIAL_STATE, {
      type: "SELECT_SERVICE",
      slug: "b12-vitamin-shot",
    });
    render(<LocationStep state={state} dispatch={() => {}} />);
    expect(screen.getByRole("button", { name: /Rancho Cucamonga/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("dispatches SELECT_LOCATION when a clinic card is clicked", () => {
    const dispatch = vi.fn();
    const state = bookingReducer(INITIAL_STATE, {
      type: "SELECT_SERVICE",
      slug: "iv-myers-cocktail",
    });
    render(<LocationStep state={state} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: /Newport Beach/ }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "SELECT_LOCATION",
      locationId: "newport-beach",
    });
  });
});
