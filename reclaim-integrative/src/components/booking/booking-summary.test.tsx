import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookingSummary } from "./booking-summary";
import { INITIAL_STATE, bookingReducer, type BookingState } from "./booking-reducer";

function selectionState(): BookingState {
  let state = bookingReducer(INITIAL_STATE, {
    type: "SELECT_SERVICE",
    slug: "iv-myers-cocktail",
  });
  state = bookingReducer(state, { type: "SELECT_LOCATION", locationId: "newport-beach" });
  state = bookingReducer(state, { type: "TOGGLE_ADD_ON", addOnId: "glut-push" });
  return state;
}

describe("BookingSummary", () => {
  it("shows a quiet placeholder before anything is selected", () => {
    render(<BookingSummary state={INITIAL_STATE} />);
    expect(
      screen.getByText("Your selections will appear here as you go."),
    ).toBeInTheDocument();
  });

  it("shows the running selection and total in the desktop sidebar", () => {
    render(<BookingSummary state={selectionState()} />);
    const sidebar = screen.getByRole("complementary", { name: "Booking summary" });
    expect(sidebar).toHaveTextContent("IV Myers Cocktail");
    expect(sidebar).toHaveTextContent("Newport Beach");
    expect(sidebar).toHaveTextContent("Glutathione Push");
    expect(sidebar).toHaveTextContent("$210");
  });

  it("renders membership pricing for program services, never $0", () => {
    const state = bookingReducer(INITIAL_STATE, {
      type: "SELECT_SERVICE",
      slug: "trt-injection",
    });
    render(<BookingSummary state={state} />);
    expect(screen.getAllByText("Membership pricing").length).toBeGreaterThan(0);
    expect(screen.queryByText(/\$0/)).not.toBeInTheDocument();
  });

  it("expands the mobile bar to reveal the full summary", () => {
    render(<BookingSummary state={selectionState()} />);
    const toggle = screen.getByRole("button", { expanded: false });
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { expanded: true })).toBeInTheDocument();
  });
});
