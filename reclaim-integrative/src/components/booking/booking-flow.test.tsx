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

describe("initStateFromParams (location-first)", () => {
  it("auto-selects the clinic and advances past location for a single-location service", () => {
    const state = initStateFromParams("eboo", null);
    expect(state.serviceSlug).toBe("eboo");
    expect(state.locationId).toBe("newport-beach"); // Newport-only auto-selects
    expect(state.step).toBe("schedule"); // no add-ons, steps past service
  });

  it("holds a both-locations service but opens on the Location step", () => {
    const state = initStateFromParams("iv-myers-cocktail", null);
    expect(state.serviceSlug).toBe("iv-myers-cocktail");
    expect(state.locationId).toBeNull();
    expect(state.step).toBe("location");
  });

  it("holds a category and opens on the Location step", () => {
    const state = initStateFromParams(null, "iv-therapy");
    expect(state.categoryId).toBe("iv-therapy");
    expect(state.locationId).toBeNull();
    expect(state.step).toBe("location");
  });

  it("falls back to the Location step with nothing pre-selected for invalid slugs", () => {
    const badService = initStateFromParams("nonsense", null);
    expect(badService.step).toBe("location");
    expect(badService.serviceSlug).toBeNull();
    const badCategory = initStateFromParams(null, "nonsense");
    expect(badCategory.step).toBe("location");
    expect(badCategory.categoryId).toBeNull();
  });

  it("prefers the service param when both are provided", () => {
    const state = initStateFromParams("blood-draw", "iv-therapy");
    expect(state.serviceSlug).toBe("blood-draw");
    expect(state.categoryId).toBe("blood-draw");
  });
});

describe("BookingFlow", () => {
  it("opens on the Location step for a generic entry", () => {
    render(<BookingFlow />);
    expect(screen.getByRole("heading", { name: "Choose a clinic" })).toBeInTheDocument();
    // Both clinics are offered when nothing is deep-linked.
    expect(screen.getByRole("button", { name: /Newport Beach/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rancho Cucamonga/ })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Booking progress" })).toBeInTheDocument();
  });

  it("deep links ?service=b12-vitamin-shot past Location (Rancho-only auto-selected)", () => {
    // B12 is Rancho-only: the clinic is auto-selected and, with no add-ons,
    // the flow lands straight on the schedule step. No dead-end Location step.
    params = new URLSearchParams("service=b12-vitamin-shot");
    render(<BookingFlow />);
    expect(screen.getByRole("heading", { name: "Pick a date and time" })).toBeInTheDocument();
    // The summary confirms the auto-selected clinic.
    const summary = screen.getByRole("complementary", { name: "Booking summary" });
    expect(summary).toHaveTextContent("Rancho Cucamonga");
    expect(summary).toHaveTextContent("B12 Vitamin Shot");
  });

  it("deep links ?service= for a both-locations service to the Location step with both clinics", () => {
    params = new URLSearchParams("service=iv-myers-cocktail");
    render(<BookingFlow />);
    expect(
      screen.getByText("IV Myers Cocktail is available at both clinics. Choose one to continue."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Newport Beach/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rancho Cucamonga/ })).toBeInTheDocument();
  });

  it("deep links ?category=consultations to Location, then the filtered service list", async () => {
    params = new URLSearchParams("category=consultations");
    render(<BookingFlow />);
    // Location first.
    expect(screen.getByRole("heading", { name: "Choose a clinic" })).toBeInTheDocument();
    // Pick a clinic, then the service list is filtered to that category.
    fireEvent.click(screen.getByRole("button", { name: /Newport Beach/ }));
    expect(await screen.findByRole("heading", { name: "Consultations" })).toBeInTheDocument();
    expect(screen.getByText("Dr. Colon Initial Consultation (Virtual)")).toBeInTheDocument();
  });

  it("falls back to the Location step for an invalid ?service=", () => {
    params = new URLSearchParams("service=nonsense");
    render(<BookingFlow />);
    expect(screen.getByRole("heading", { name: "Choose a clinic" })).toBeInTheDocument();
  });

  it("walks the full location-first flow to confirmation", async () => {
    render(<BookingFlow />);

    // Step 1: location.
    fireEvent.click(screen.getByRole("button", { name: /Newport Beach/ }));

    // Step 2: category, then service.
    fireEvent.click(await screen.findByRole("button", { name: /Blood Draw/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Blood Draw.*30 min/s }));

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

  it("clears an invalid service when going back to change location (invalidation path)", async () => {
    // Deep-link B12 (Rancho-only): auto-selected Rancho, on the schedule step.
    params = new URLSearchParams("service=b12-vitamin-shot");
    render(<BookingFlow />);
    // Go back to Location via the step indicator.
    fireEvent.click(screen.getByRole("button", { name: "Location" }));
    // Switch to Newport, where B12 is not offered.
    fireEvent.click(await screen.findByRole("button", { name: /Newport Beach/ }));
    // Service is cleared and we are on the Service step choosing a category.
    expect(await screen.findByText("What brings you in?")).toBeInTheDocument();
  });

  it("supports backwards navigation via the step indicator", async () => {
    params = new URLSearchParams("service=blood-draw");
    render(<BookingFlow />);
    // blood-draw is both-locations, so we open on Location; pick a clinic.
    fireEvent.click(screen.getByRole("button", { name: /Newport Beach/ }));
    await screen.findByRole("group", { name: "Choose a date" });
    // Blood Draw has no add-ons, so the schedule step follows service directly;
    // step back to Service via the indicator.
    fireEvent.click(screen.getByRole("button", { name: "Service" }));
    expect(await screen.findByRole("heading", { name: "Blood Draw" })).toBeInTheDocument();
  });
});
