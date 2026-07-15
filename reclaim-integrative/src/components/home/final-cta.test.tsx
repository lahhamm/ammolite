import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinalCta } from "./final-cta";

describe("FinalCta", () => {
  it("uses the canonical booking CTA label", () => {
    render(<FinalCta />);
    expect(screen.getByRole("button", { name: "Book an Appointment" })).toBeInTheDocument();
  });

  it("does not reuse the gold accent, which is reserved for the hero CTA only", () => {
    render(<FinalCta />);
    const button = screen.getByRole("button", { name: "Book an Appointment" });
    expect(button.className).not.toContain("bg-accent-gold");
  });
});
