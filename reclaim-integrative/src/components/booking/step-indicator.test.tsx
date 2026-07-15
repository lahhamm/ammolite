import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StepIndicator } from "./step-indicator";
import type { StepId } from "./booking-reducer";

const STEPS: StepId[] = ["service", "location", "addons", "schedule", "details", "review"];

describe("StepIndicator", () => {
  it("marks the current step with aria-current", () => {
    render(<StepIndicator steps={STEPS} currentStep="addons" onNavigate={() => {}} />);
    const current = screen.getByRole("button", { name: "Add-ons" });
    expect(current).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: "Service" })).not.toHaveAttribute("aria-current");
  });

  it("allows navigating backwards to completed steps only", () => {
    const onNavigate = vi.fn();
    render(<StepIndicator steps={STEPS} currentStep="schedule" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("button", { name: "Location" }));
    expect(onNavigate).toHaveBeenCalledWith("location");
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(onNavigate).toHaveBeenCalledTimes(1); // future steps are inert
    expect(screen.getByRole("button", { name: "Review" })).toBeDisabled();
  });

  it("omits the add-ons step when the flow skips it", () => {
    const noAddOns = STEPS.filter((s) => s !== "addons");
    render(<StepIndicator steps={noAddOns} currentStep="service" onNavigate={() => {}} />);
    expect(screen.queryByRole("button", { name: "Add-ons" })).not.toBeInTheDocument();
  });
});
