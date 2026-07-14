import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CuratedCredibility } from "./curated-credibility";

describe("CuratedCredibility", () => {
  it("features exactly the two strongest placements, not the full press wall", () => {
    render(<CuratedCredibility />);
    expect(screen.getByText("GQ")).toBeInTheDocument();
    expect(screen.getByText("Marie Claire")).toBeInTheDocument();
    expect(screen.queryByText("Good Housekeeping")).not.toBeInTheDocument();
  });

  it("renders the real stat strip", () => {
    render(<CuratedCredibility />);
    ["3B+", "11+", "7", "117M+"].forEach((stat) => {
      expect(screen.getByText(stat)).toBeInTheDocument();
    });
  });

  it("links to the full As Seen In page exactly once", () => {
    render(<CuratedCredibility />);
    const links = screen.getAllByRole("link", { name: /view all press features/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/press");
  });
});
