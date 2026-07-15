import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TherapyHighlight } from "./therapy-highlight";

describe("TherapyHighlight", () => {
  it("renders EBOO therapy section", () => {
    render(<TherapyHighlight />);
    expect(screen.getByText(/EBOO Therapy/)).toBeInTheDocument();
    expect(screen.queryByText(/BEMER PEMF Therapy/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });

  it("uses the canonical booking CTA label, deep-linked to EBOO booking", () => {
    render(<TherapyHighlight />);
    const cta = screen.getByRole("link", { name: "Book an Appointment" });
    expect(cta).toHaveAttribute("href", "/book?service=eboo");
    expect(screen.queryByText(/schedule online/i)).not.toBeInTheDocument();
  });
});
