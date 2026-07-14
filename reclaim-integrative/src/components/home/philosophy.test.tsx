import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Philosophy } from "./philosophy";

describe("Philosophy", () => {
  it("renders exactly one heading and one paragraph, stacked not split", () => {
    render(<Philosophy />);
    const heading = screen.getByRole("heading");
    const paragraph = screen.getByText(/root cause/i);
    expect(heading).toBeInTheDocument();
    expect(paragraph.tagName).toBe("P");
  });

  it("contains no em-dash anywhere in the copy", () => {
    const { container } = render(<Philosophy />);
    expect(container.textContent).not.toMatch(/—|–/);
  });
});
