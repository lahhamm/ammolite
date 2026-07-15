import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConfirmationScreen } from "./confirmation-screen";
import { INITIAL_STATE, bookingReducer, type BookingState } from "./booking-reducer";

function confirmedState(): BookingState {
  let state = bookingReducer(INITIAL_STATE, { type: "SELECT_SERVICE", slug: "eboo" });
  state = bookingReducer(state, { type: "SELECT_DATE", date: "2026-07-21" });
  state = bookingReducer(state, { type: "SELECT_TIME", time: "09:00" });
  state = bookingReducer(state, {
    type: "SET_DETAILS",
    details: { name: "Alex Doe", email: "alex@example.com", phone: "9495550100" },
  });
  return bookingReducer(state, { type: "CONFIRM" });
}

describe("ConfirmationScreen", () => {
  it("shows the appointment summary with a stable confirmation code", () => {
    render(<ConfirmationScreen state={confirmedState()} />);
    expect(screen.getByText("You are booked in")).toBeInTheDocument();
    expect(screen.getByText(/Confirmation RI-\d{6}/)).toBeInTheDocument();
    expect(screen.getByText("EBOO")).toBeInTheDocument();
    expect(screen.getByText("Newport Beach")).toBeInTheDocument();
    expect(screen.getByText("Tuesday, July 21, 2026")).toBeInTheDocument();
    expect(screen.getByText("$1,200")).toBeInTheDocument();
  });

  it("lists the what-happens-next guidance", () => {
    render(<ConfirmationScreen state={confirmedState()} />);
    expect(screen.getByText(/Intake forms will arrive by email/)).toBeInTheDocument();
    expect(screen.getByText(/arrive 10 minutes early/)).toBeInTheDocument();
    expect(screen.getByText(/24 hours ahead/)).toBeInTheDocument();
  });

  it("shows a dismissible demo notice", () => {
    render(<ConfirmationScreen state={confirmedState()} />);
    expect(
      screen.getByText("Demo preview. No appointment has been created."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notice" }));
    expect(
      screen.queryByText("Demo preview. No appointment has been created."),
    ).not.toBeInTheDocument();
  });

  it("links back to the homepage", () => {
    render(<ConfirmationScreen state={confirmedState()} />);
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });
});
