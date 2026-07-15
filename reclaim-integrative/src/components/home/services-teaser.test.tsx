import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServicesTeaser } from "./services-teaser";

describe("ServicesTeaser", () => {
  it("features four specific offerings", () => {
    render(<ServicesTeaser />);
    const expectedServices = [
      "Hormone & Thyroid Optimization",
      "Cellular Health & IV Therapy",
      "Gut Health & Metabolism",
      "Longevity & Regeneration",
    ];
    expectedServices.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("links through to the full Services page exactly once", () => {
    render(<ServicesTeaser />);
    const links = screen.getAllByRole("link", { name: /explore all services/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/services");
  });

  it("exposes each pillar as an accessible expandable button (tap/keyboard, not hover-only)", () => {
    render(<ServicesTeaser />);
    const buttons = screen.getAllByRole("button");
    // Four pillars, each a real button element.
    expect(buttons).toHaveLength(4);
    // First is expanded by default, the rest collapsed.
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("expands a pillar on click (tap), not just hover", () => {
    render(<ServicesTeaser />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);
    expect(buttons[2]).toHaveAttribute("aria-expanded", "true");
    // Selecting a new pillar collapses the previously active one.
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
  });
});
