import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServicesTeaser } from "./services-teaser";

describe("ServicesTeaser", () => {
  it("renders all four service categories", () => {
    render(<ServicesTeaser />);
    ["Hormone Replacement", "IV Therapy", "Peptide Therapy", "Digestive Health"].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("renders at least two images for visual variation across the grid", () => {
    render(<ServicesTeaser />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it("links through to the full Services page exactly once", () => {
    render(<ServicesTeaser />);
    const links = screen.getAllByRole("link", { name: /view all services/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/services");
  });
});
