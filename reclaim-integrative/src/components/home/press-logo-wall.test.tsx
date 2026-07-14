import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PressLogoWall } from "./press-logo-wall";

describe("PressLogoWall", () => {
  it("renders all six press placements with no category label beneath any of them", () => {
    render(<PressLogoWall />);
    ["GQ", "Marie Claire", "Good Housekeeping", "Yahoo! Health", "Food & Wine", "Authority Magazine"].forEach(
      (name) => {
        expect(screen.getByText(name)).toBeInTheDocument();
      }
    );
    expect(screen.queryByText(/monthly readers/i)).not.toBeInTheDocument();
  });

  it("renders no section eyebrow", () => {
    render(<PressLogoWall />);
    expect(screen.queryByTestId("eyebrow")).not.toBeInTheDocument();
  });
});
