import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TherapyHighlight } from "./therapy-highlight";

describe("TherapyHighlight", () => {
  it("renders both EBOO and BEMER as one combined section, not two", () => {
    render(<TherapyHighlight />);
    expect(screen.getByText(/EBOO Therapy/)).toBeInTheDocument();
    expect(screen.getByText(/BEMER PEMF Therapy/)).toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });

  it("uses the canonical booking CTA label, not a duplicate variant", () => {
    render(<TherapyHighlight />);
    expect(screen.getByRole("button", { name: "Schedule Consultation" })).toBeInTheDocument();
    expect(screen.queryByText(/schedule online/i)).not.toBeInTheDocument();
  });
});
