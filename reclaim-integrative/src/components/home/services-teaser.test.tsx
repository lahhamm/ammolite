import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServicesTeaser } from "./services-teaser";

describe("ServicesTeaser", () => {
  it("features four specific offerings", () => {
    render(<ServicesTeaser />);
    const expectedServices = ["Hormone Optimization", "IV Therapy", "Peptide Therapy", "Gut Health & Nutrition"];
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
});
