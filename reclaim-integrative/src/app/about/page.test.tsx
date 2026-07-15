import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "./page";

// Covers the press-credibility section folded into the About page after Press
// left the top nav. Deliberately does not assert on bio wording, which is
// owner-corrected and must not be altered.
describe("AboutPage press-credibility section", () => {
  it("renders the press stat strip mirroring the /press stats", () => {
    render(<AboutPage />);
    expect(screen.getByText("3B+")).toBeInTheDocument();
    expect(screen.getByText("11+")).toBeInTheDocument();
    expect(screen.getByText("7+")).toBeInTheDocument();
    expect(screen.getByText("117M+")).toBeInTheDocument();
  });

  it("names flagship outlets and links to the full press page", () => {
    render(<AboutPage />);
    expect(
      screen.getByText(/GQ, Marie Claire, and Good Housekeeping/),
    ).toBeInTheDocument();
    const pressLink = screen.getByRole("link", {
      name: "Explore her features in the press",
    });
    expect(pressLink).toHaveAttribute("href", "/press");
  });
});
