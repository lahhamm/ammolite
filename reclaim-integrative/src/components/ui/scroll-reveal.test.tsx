import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollReveal } from "./scroll-reveal";

describe("ScrollReveal", () => {
  it("renders its children", () => {
    render(
      <ScrollReveal>
        <p>Section content</p>
      </ScrollReveal>
    );
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });
});
