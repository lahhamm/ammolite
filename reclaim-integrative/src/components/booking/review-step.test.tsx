import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReviewStep } from "./review-step";
import { INITIAL_STATE, bookingReducer, type BookingState } from "./booking-reducer";

function completeState(): BookingState {
  let state = bookingReducer(INITIAL_STATE, {
    type: "SELECT_SERVICE",
    slug: "iv-myers-cocktail",
  });
  state = bookingReducer(state, { type: "SELECT_LOCATION", locationId: "newport-beach" });
  state = bookingReducer(state, { type: "TOGGLE_ADD_ON", addOnId: "glut-push" });
  state = bookingReducer(state, { type: "SELECT_DATE", date: "2026-07-21" });
  state = bookingReducer(state, { type: "SELECT_TIME", time: "10:00" });
  state = bookingReducer(state, {
    type: "SET_DETAILS",
    details: {
      name: "Alex Doe",
      email: "alex@example.com",
      phone: "9495550100",
      patientType: "returning",
    },
  });
  return { ...state, step: "review" };
}

describe("ReviewStep", () => {
  it("summarizes service, add-ons, location, time, patient, and total", () => {
    render(<ReviewStep state={completeState()} dispatch={() => {}} />);
    expect(screen.getByText(/IV Myers Cocktail/)).toBeInTheDocument();
    expect(screen.getByText("Glutathione Push")).toBeInTheDocument();
    expect(screen.getAllByText(/Newport Beach/).length).toBeGreaterThan(0);
    expect(screen.getByText(/1100 Quail Street/)).toBeInTheDocument();
    expect(screen.getByText("Tuesday, July 21, 2026")).toBeInTheDocument();
    expect(screen.getByText(/10:00 AM Pacific Time/)).toBeInTheDocument();
    expect(screen.getByText("Alex Doe")).toBeInTheDocument();
    expect(screen.getByText("$210")).toBeInTheDocument(); // 160 + 50
  });

  it("dispatches CONFIRM from the confirm button", () => {
    const dispatch = vi.fn();
    render(<ReviewStep state={completeState()} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "CONFIRM" });
  });

  it("supports back navigation to details", () => {
    const dispatch = vi.fn();
    render(<ReviewStep state={completeState()} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "GO_TO_STEP", step: "details" });
  });

  it("degrades gracefully when selections are incomplete", () => {
    render(<ReviewStep state={INITIAL_STATE} dispatch={() => {}} />);
    expect(screen.getByText(/Some details are missing/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm booking" })).not.toBeInTheDocument();
  });
});
