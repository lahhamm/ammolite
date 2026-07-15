import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinalCta } from "./final-cta";

describe("FinalCta", () => {
  it("uses the canonical booking CTA label linking to the booking flow", () => {
    render(<FinalCta />);
    const cta = screen.getByRole("link", { name: "Book an Appointment" });
    expect(cta).toHaveAttribute("href", "/book");
  });

  it("does not reuse the gold accent, which is reserved for the hero CTA only", () => {
    render(<FinalCta />);
    const cta = screen.getByRole("link", { name: "Book an Appointment" });
    expect(cta.className).not.toContain("bg-accent-gold");
  });
});
