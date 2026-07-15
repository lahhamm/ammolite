import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocationStep } from "./location-step";
import { INITIAL_STATE, type BookingState } from "./booking-reducer";

// Location comes first, so the plain landing has no service held.
function heldService(slug: string): BookingState {
  // A deep-linked service that still needs a clinic: service set, location null.
  return { ...INITIAL_STATE, serviceSlug: slug, locationId: null };
}

describe("LocationStep", () => {
  it("shows both clinics on a generic entry (no service held)", () => {
    render(<LocationStep state={INITIAL_STATE} dispatch={() => {}} />);
    expect(screen.getByRole("button", { name: /Newport Beach/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rancho Cucamonga/ })).toBeInTheDocument();
    expect(screen.getByText(/two clinics are a distance apart/)).toBeInTheDocument();
  });

  it("shows both clinics for a both-locations service deep link", () => {
    render(<LocationStep state={heldService("blood-draw")} dispatch={() => {}} />);
    expect(screen.getByRole("button", { name: /Newport Beach/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rancho Cucamonga/ })).toBeInTheDocument();
    expect(
      screen.getByText("Blood Draw is available at both clinics. Choose one to continue."),
    ).toBeInTheDocument();
  });

  it("scopes to the only clinic for a single-location service deep link (no dead-end card)", () => {
    render(<LocationStep state={heldService("eboo")} dispatch={() => {}} />);
    expect(screen.getByRole("button", { name: /Newport Beach/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rancho Cucamonga/ })).not.toBeInTheDocument();
    expect(
      screen.getByText("EBOO is available at our Newport Beach clinic."),
    ).toBeInTheDocument();
  });

  it("shows all clinics when revisited after a location was chosen, so it can be switched", () => {
    // Returning to change a Rancho-scoped single-location booking: both clinics
    // appear so the visitor can switch (which then invalidates the service).
    const revisiting: BookingState = {
      ...INITIAL_STATE,
      serviceSlug: "b12-vitamin-shot",
      locationId: "rancho-cucamonga",
    };
    render(<LocationStep state={revisiting} dispatch={() => {}} />);
    expect(screen.getByRole("button", { name: /Newport Beach/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rancho Cucamonga/ })).toBeInTheDocument();
  });

  it("dispatches SELECT_LOCATION when a clinic card is clicked", () => {
    const dispatch = vi.fn();
    render(<LocationStep state={heldService("iv-myers-cocktail")} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: /Newport Beach/ }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "SELECT_LOCATION",
      locationId: "newport-beach",
    });
  });
});
