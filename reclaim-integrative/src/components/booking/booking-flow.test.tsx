import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookingFlow, initStateFromParams } from "./booking-flow";

let params = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => params,
}));

beforeEach(() => {
  params = new URLSearchParams();
});

describe("initStateFromParams", () => {
  it("pre-selects a valid service and opens on the location step", () => {
    const state = initStateFromParams("eboo", null);
    expect(state.serviceSlug).toBe("eboo");
    expect(state.step).toBe("location");
    expect(state.locationId).toBe("newport-beach"); // single location auto-selects
  });

  it("pre-selects a valid category and stays on the service step", () => {
    const state = initStateFromParams(null, "iv-therapy");
    expect(state.categoryId).toBe("iv-therapy");
    expect(state.step).toBe("service");
  });

  it("falls back to the welcome step for invalid slugs", () => {
    expect(initStateFromParams("nonsense", null).step).toBe("service");
    expect(initStateFromParams("nonsense", null).serviceSlug).toBeNull();
    expect(initStateFromParams(null, "nonsense").categoryId).toBeNull();
  });

  it("prefers the service param when both are provided", () => {
    const state = initStateFromParams("blood-draw", "iv-therapy");
    expect(state.serviceSlug).toBe("blood-draw");
    expect(state.categoryId).toBe("blood-draw");
  });
});

describe("BookingFlow", () => {
  it("opens on the welcome step with category cards for a generic entry", () => {
    render(<BookingFlow />);
    expect(screen.getByText("What brings you in?")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Booking progress" })).toBeInTheDocument();
  });

  it("deep links ?service=b12-vitamin-shot straight to the location step", () => {
    params = new URLSearchParams("service=b12-vitamin-shot");
    render(<BookingFlow />);
    expect(screen.getByText("Choose a clinic")).toBeInTheDocument();
    expect(
      screen.getByText("B12 Vitamin Shot is available at our Rancho Cucamonga clinic."),
    ).toBeInTheDocument();
  });

  it("deep links ?category=consultations to that category's service list", () => {
    params = new URLSearchParams("category=consultations");
    render(<BookingFlow />);
    expect(screen.getByRole("heading", { name: "Consultations" })).toBeInTheDocument();
    expect(screen.getByText("Dr. Colon Initial Consultation (Virtual)")).toBeInTheDocument();
  });

  it("falls back to the welcome step for an invalid ?service=", () => {
    params = new URLSearchParams("service=nonsense");
    render(<BookingFlow />);
    expect(screen.getByText("What brings you in?")).toBeInTheDocument();
  });

  it("walks the full flow from category to confirmation", async () => {
    render(<BookingFlow />);

    // Step 1: category, then service.
    fireEvent.click(screen.getByRole("button", { name: /Blood Draw/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Blood Draw.*30 min/s }));

    // Step 2: location.
    fireEvent.click(await screen.findByRole("button", { name: /Newport Beach/ }));

    // Step 4 (add-ons skipped): pick the first available day and time.
    const dateGroup = await screen.findByRole("group", { name: "Choose a date" });
    const day = within(dateGroup)
      .getAllByRole("button")
      .find((b) => !b.hasAttribute("disabled"));
    expect(day).toBeDefined();
    fireEvent.click(day!);
    const timeGroup = await screen.findByRole("group", { name: "Choose a time" });
    const slot = within(timeGroup)
      .getAllByRole("button")
      .find((b) => !b.hasAttribute("disabled"));
    expect(slot).toBeDefined();
    fireEvent.click(slot!);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Step 5: details.
    fireEvent.change(await screen.findByLabelText("Full name"), {
      target: { value: "Alex Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "9495550100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Review booking" }));

    // Step 6: review and confirm.
    expect(await screen.findByText("Review your booking")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(await screen.findByText("You are booked in")).toBeInTheDocument();
    expect(
      screen.getByText("Demo preview. No appointment has been created."),
    ).toBeInTheDocument();
  });

  it("supports backwards navigation via the step indicator", async () => {
    params = new URLSearchParams("service=blood-draw");
    render(<BookingFlow />);
    fireEvent.click(screen.getByRole("button", { name: /Newport Beach/ }));
    await screen.findByRole("group", { name: "Choose a date" });
    fireEvent.click(screen.getByRole("button", { name: "Service" }));
    expect(await screen.findByRole("heading", { name: "Blood Draw" })).toBeInTheDocument();
  });
});
