import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DetailsStep } from "./details-step";
import { INITIAL_STATE, bookingReducer, type BookingState } from "./booking-reducer";

const BASE_STATE = bookingReducer(INITIAL_STATE, {
  type: "SELECT_SERVICE",
  slug: "blood-draw",
});

function stateWithDetails(details: Partial<BookingState["details"]>): BookingState {
  return { ...BASE_STATE, details: { ...BASE_STATE.details, ...details } };
}

describe("DetailsStep", () => {
  it("renders labelled name, email, and phone inputs with correct types", () => {
    render(<DetailsStep state={BASE_STATE} dispatch={() => {}} />);
    expect(screen.getByLabelText("Full name")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Phone")).toHaveAttribute("type", "tel");
  });

  it("offers a new vs returning patient radio choice", () => {
    render(<DetailsStep state={BASE_STATE} dispatch={() => {}} />);
    expect(screen.getByRole("radio", { name: "New patient" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Returning patient" })).not.toBeChecked();
  });

  it("blocks submission and shows visible validation errors for empty fields", () => {
    const dispatch = vi.fn();
    render(<DetailsStep state={BASE_STATE} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: "Review booking" }));
    expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Please enter a 10 digit phone number.")).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalledWith({ type: "GO_TO_STEP", step: "review" });
  });

  it("advances to review when the form is valid", () => {
    const dispatch = vi.fn();
    const state = stateWithDetails({
      name: "Alex Doe",
      email: "alex@example.com",
      phone: "(949) 555-0100",
    });
    render(<DetailsStep state={state} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: "Review booking" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "GO_TO_STEP", step: "review" });
  });

  it("dispatches SET_DETAILS as fields change", () => {
    const dispatch = vi.fn();
    render(<DetailsStep state={BASE_STATE} dispatch={dispatch} />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "A" } });
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_DETAILS", details: { name: "A" } });
  });
});
