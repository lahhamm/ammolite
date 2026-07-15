import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Testimonials } from "./testimonials";

describe("Testimonials", () => {
  it("renders 9 testimonials in the columns", () => {
    render(<Testimonials />);
    // The component repeats the array twice (new Array(2).fill(0)), so we should find 2 of each
    expect(screen.getAllByText("Sarah Jenkins")).toHaveLength(2);
    expect(screen.getAllByText("Michael Torres")).toHaveLength(2);
    expect(screen.getAllByText("Emily Chen")).toHaveLength(2);
    expect(screen.getAllByText("David Alby")).toHaveLength(2);
    expect(screen.getAllByText("Jessica Rivera")).toHaveLength(2);
    expect(screen.getAllByText("Robert Hughes")).toHaveLength(2);
    expect(screen.getAllByText("Amanda Smith")).toHaveLength(2);
    expect(screen.getAllByText("Thomas Wright")).toHaveLength(2);
    expect(screen.getAllByText("Elena Rodriguez")).toHaveLength(2);
  });

  it("renders the heading correctly", () => {
    render(<Testimonials />);
    expect(screen.getByText("Patient Stories")).toBeInTheDocument();
    expect(screen.getByText(/Real results/)).toBeInTheDocument();
  });
});
