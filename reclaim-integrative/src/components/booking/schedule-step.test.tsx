import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScheduleStep } from "./schedule-step";
import { INITIAL_STATE, bookingReducer, type BookingState } from "./booking-reducer";

// Monday, July 20 2026, 8:00 AM: full day ahead, nothing in the past.
const NOW = new Date(2026, 6, 20, 8, 0);

const BASE_STATE: BookingState = {
  ...bookingReducer(INITIAL_STATE, {
    type: "SELECT_SERVICE",
    slug: "blood-draw",
  }),
  locationId: "newport-beach",
};

describe("ScheduleStep", () => {
  it("renders a 14-day date strip with Sundays closed", () => {
    render(<ScheduleStep state={BASE_STATE} dispatch={() => {}} now={NOW} />);
    const dateGroup = screen.getByRole("group", { name: "Choose a date" });
    expect(dateGroup.querySelectorAll("button")).toHaveLength(14);
    // 2026-07-26 is the Sunday in the window.
    const sunday = screen.getByRole("button", { name: /Sun, Jul 26/ });
    expect(sunday).toBeDisabled();
    expect(sunday).toHaveTextContent("Closed");
  });

  it("shows time slots for the selected day and dispatches the choice", () => {
    const dispatch = vi.fn();
    const state: BookingState = { ...BASE_STATE, date: "2026-07-21" };
    render(<ScheduleStep state={state} dispatch={dispatch} now={NOW} />);
    const timeGroup = screen.getByRole("group", { name: "Choose a time" });
    const enabled = Array.from(timeGroup.querySelectorAll("button:not([disabled])"));
    expect(enabled.length).toBeGreaterThan(0);
    fireEvent.click(enabled[0]);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SELECT_TIME" }),
    );
  });

  it("mentions Pacific Time and the visit duration", () => {
    render(<ScheduleStep state={BASE_STATE} dispatch={() => {}} now={NOW} />);
    expect(screen.getByText(/Pacific Time/)).toBeInTheDocument();
    expect(screen.getByText(/30 minute visit/)).toBeInTheDocument();
  });

  it("only offers Continue once both date and time are chosen", () => {
    const noTime: BookingState = { ...BASE_STATE, date: "2026-07-21" };
    const { rerender } = render(
      <ScheduleStep state={noTime} dispatch={() => {}} now={NOW} />,
    );
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
    const withTime: BookingState = { ...noTime, time: "10:00" };
    rerender(<ScheduleStep state={withTime} dispatch={() => {}} now={NOW} />);
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("renders a quiet loading state until the clock is known", () => {
    render(<ScheduleStep state={BASE_STATE} dispatch={() => {}} now={null} />);
    expect(screen.getByText(/Loading availability/)).toBeInTheDocument();
  });

  it("renders a quiet loading state until a location is chosen", () => {
    const noLocation: BookingState = { ...BASE_STATE, locationId: null };
    render(<ScheduleStep state={noLocation} dispatch={() => {}} now={NOW} />);
    expect(screen.getByText(/Loading availability/)).toBeInTheDocument();
  });

  it("shows only Thursday and Saturday as open for Rancho Cucamonga, with an explanatory note", () => {
    const rancho: BookingState = { ...BASE_STATE, locationId: "rancho-cucamonga" };
    render(<ScheduleStep state={rancho} dispatch={() => {}} now={NOW} />);
    // The sparse-schedule note explains why most days are closed.
    expect(
      screen.getByText("Our Rancho Cucamonga clinic is open Thursday and Saturday."),
    ).toBeInTheDocument();
    const dateGroup = screen.getByRole("group", { name: "Choose a date" });
    const buttons = Array.from(dateGroup.querySelectorAll("button"));
    // 14-day strip is intact even though most days are closed.
    expect(buttons).toHaveLength(14);
    const enabled = buttons.filter((b) => !b.hasAttribute("disabled"));
    // Two Thursdays and two Saturdays fall in the window from Mon Jul 20.
    expect(enabled).toHaveLength(4);
    for (const b of enabled) {
      expect(b.textContent).toMatch(/Thu|Sat/);
    }
  });

  it("does not show the sparse-schedule note for Newport Beach", () => {
    render(<ScheduleStep state={BASE_STATE} dispatch={() => {}} now={NOW} />);
    expect(screen.queryByText(/clinic is open/)).not.toBeInTheDocument();
  });
});
