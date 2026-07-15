import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CuratedCredibility } from "./curated-credibility";

describe("CuratedCredibility", () => {
  it("features exactly the two strongest placements, not the full press wall", () => {
    render(<CuratedCredibility />);
    expect(screen.getByText("Good Housekeeping")).toBeInTheDocument();
    expect(screen.getByText("Marie Claire")).toBeInTheDocument();
    expect(screen.queryByText("GQ")).not.toBeInTheDocument();
  });

  it("links to the full Press page exactly once", () => {
    render(<CuratedCredibility />);
    const links = screen.getAllByRole("link", { name: /view all press/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/press");
  });
});
