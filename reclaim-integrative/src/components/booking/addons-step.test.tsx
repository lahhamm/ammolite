import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddOnsStep } from "./addons-step";
import { INITIAL_STATE, bookingReducer } from "./booking-reducer";

const HANGOVER_STATE = bookingReducer(INITIAL_STATE, {
  type: "SELECT_SERVICE",
  slug: "iv-hangover",
});

describe("AddOnsStep", () => {
  it("lists the suggested add-ons with price deltas", () => {
    render(<AddOnsStep state={HANGOVER_STATE} dispatch={() => {}} />);
    expect(screen.getByText("B12 Vitamin Shot")).toBeInTheDocument();
    expect(screen.getByText("Glutathione Push")).toBeInTheDocument();
    expect(screen.getByText("IV Glutathione, 1 Gram")).toBeInTheDocument();
    expect(screen.getByText("Taurine Vitamin Shot")).toBeInTheDocument();
    expect(screen.getByText("+ $50")).toBeInTheDocument();
  });

  it("dispatches TOGGLE_ADD_ON when a checkbox card is toggled", () => {
    const dispatch = vi.fn();
    render(<AddOnsStep state={HANGOVER_STATE} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("checkbox", { name: /B12 Vitamin Shot/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: "TOGGLE_ADD_ON", addOnId: "b12-addon" });
  });

  it("marks selected add-ons as checked", () => {
    const state = bookingReducer(HANGOVER_STATE, {
      type: "TOGGLE_ADD_ON",
      addOnId: "glut-push",
    });
    render(<AddOnsStep state={state} dispatch={() => {}} />);
    expect(screen.getByRole("checkbox", { name: /Glutathione Push/ })).toBeChecked();
  });

  it("offers a skip-friendly continue label and advances to scheduling", () => {
    const dispatch = vi.fn();
    render(<AddOnsStep state={HANGOVER_STATE} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue without add-ons" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "GO_TO_STEP", step: "schedule" });
  });
});
