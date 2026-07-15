import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceStep } from "./service-step";
import { INITIAL_STATE, type BookingState } from "./booking-reducer";

// Location is chosen before services, so the category view is scoped to a clinic.
const NEWPORT: BookingState = { ...INITIAL_STATE, locationId: "newport-beach" };
const RANCHO: BookingState = { ...INITIAL_STATE, locationId: "rancho-cucamonga" };

describe("ServiceStep", () => {
  it("shows all five category cards at Newport Beach, with clinic-scoped counts", () => {
    render(<ServiceStep state={NEWPORT} dispatch={() => {}} />);
    for (const name of [
      "Blood Draw",
      "Consultations",
      "Vitamin Injections (IM Shots)",
      "IV Therapy",
      "EBOO Therapy",
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText("15 services")).toBeInTheDocument(); // IV Therapy (both clinics)
    expect(screen.getAllByText("1 service")).toHaveLength(2); // Blood Draw + EBOO
    expect(screen.getByText(/Newport Beach clinic/)).toBeInTheDocument();
  });

  it("hides EBOO and Rancho-only reductions when scoped to Rancho Cucamonga", () => {
    render(<ServiceStep state={RANCHO} dispatch={() => {}} />);
    // EBOO is Newport-only, so its category card is not shown at Rancho.
    expect(screen.queryByText("EBOO Therapy")).not.toBeInTheDocument();
    // Rancho offers all 7 IM shots; Newport offers only 3.
    const imShotsCard = screen.getByText("Vitamin Injections (IM Shots)").closest("button");
    expect(imShotsCard).not.toBeNull();
    expect(within(imShotsCard!).getByText("7 services")).toBeInTheDocument();
  });

  it("dispatches SELECT_CATEGORY when a category card is clicked", () => {
    const dispatch = vi.fn();
    render(<ServiceStep state={NEWPORT} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: /IV Therapy/ }));
    expect(dispatch).toHaveBeenCalledWith({
      type: "SELECT_CATEGORY",
      categoryId: "iv-therapy",
    });
  });

  it("lists services with duration, kind, and price once a category is chosen", () => {
    const state: BookingState = { ...RANCHO, categoryId: "im-shots" };
    render(<ServiceStep state={state} dispatch={() => {}} />);
    expect(screen.getByText("B12 Vitamin Shot")).toBeInTheDocument();
    expect(screen.getAllByText(/15 min · Procedure/).length).toBeGreaterThan(0);
    expect(screen.getByText("$25")).toBeInTheDocument();
  });

  it("hides Rancho-only shots when the chosen clinic is Newport Beach", () => {
    const state: BookingState = { ...NEWPORT, categoryId: "im-shots" };
    render(<ServiceStep state={state} dispatch={() => {}} />);
    // B12, Mega B, Taurine, Fat Burner with B12 are Rancho-only.
    expect(screen.queryByText("B12 Vitamin Shot")).not.toBeInTheDocument();
    expect(screen.queryByText("Mega B Vitamin Shot")).not.toBeInTheDocument();
    // Fat Burner (plain) is offered at both.
    expect(screen.getByText("Fat Burner Vitamin Shot")).toBeInTheDocument();
  });

  it("renders membership pricing, never $0, for program services", () => {
    const state: BookingState = { ...RANCHO, categoryId: "im-shots" };
    render(<ServiceStep state={state} dispatch={() => {}} />);
    expect(screen.getAllByText("Membership pricing")).toHaveLength(2); // TRT + Semaglutide
    expect(screen.queryByText("$0")).not.toBeInTheDocument();
  });

  it("dispatches SELECT_SERVICE when a service row is clicked", () => {
    const dispatch = vi.fn();
    const state: BookingState = { ...NEWPORT, categoryId: "blood-draw" };
    render(<ServiceStep state={state} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: /Blood Draw/ }));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SELECT_SERVICE", slug: "blood-draw" }),
    );
  });

  it("shows a dosage select for IV Vitamin C that updates the shown price", () => {
    const state: BookingState = { ...NEWPORT, categoryId: "iv-therapy" };
    render(<ServiceStep state={state} dispatch={() => {}} />);
    const select = screen.getByLabelText("Dosage");
    expect(select).toBeInTheDocument();
    const row = select.closest("li");
    expect(row).not.toBeNull();
    expect(within(row!).getByText("$180")).toBeInTheDocument();
    fireEvent.change(select, { target: { value: "50g" } });
    expect(within(row!).getByText("$240")).toBeInTheDocument();
  });

  it("shows quiet requirement notes for asterisked services", () => {
    const state: BookingState = { ...NEWPORT, categoryId: "iv-therapy" };
    render(<ServiceStep state={state} dispatch={() => {}} />);
    expect(screen.getByText("Requires G6PD enzyme marker blood draw.")).toBeInTheDocument();
    expect(screen.getByText("Requires documentation of low iron.")).toBeInTheDocument();
  });

  it("expands service descriptions on demand", () => {
    const state: BookingState = { ...NEWPORT, categoryId: "blood-draw" };
    render(<ServiceStep state={state} dispatch={() => {}} />);
    expect(screen.queryByText(/Typically fasting/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText(/Typically fasting/)).toBeInTheDocument();
  });

  it("returns to categories via the back control", () => {
    const dispatch = vi.fn();
    const state: BookingState = { ...NEWPORT, categoryId: "eboo" };
    render(<ServiceStep state={state} dispatch={dispatch} />);
    fireEvent.click(screen.getByRole("button", { name: /All categories/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: "CLEAR_CATEGORY" });
  });
});
