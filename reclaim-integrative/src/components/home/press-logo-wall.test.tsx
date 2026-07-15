import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PressLogoWall } from "./press-logo-wall";

describe("PressLogoWall", () => {
  it("renders all six press placements with no category label beneath any of them", () => {
    render(<PressLogoWall />);
    [
      "GQ",
      "Marie Claire",
      "Good Housekeeping",
      "Food & Wine",
      "Authority Magazine",
      "VoyageLA",
      "Beauty Matter"
    ].forEach((name) => {
      const elements = screen.getAllByText(name);
      expect(elements.length).toBeGreaterThan(0);
    });
    expect(screen.queryByText(/monthly readers/i)).not.toBeInTheDocument();
  });

  it("renders no section eyebrow", () => {
    render(<PressLogoWall />);
    expect(screen.queryByTestId("eyebrow")).not.toBeInTheDocument();
  });
});
