import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Testimonials } from "./testimonials";

describe("Testimonials", () => {
  it("renders exactly three testimonials", () => {
    render(<Testimonials />);
    expect(screen.getAllByTestId("testimonial-card")).toHaveLength(3);
  });

  it("keeps every quote to 3 lines or fewer by character budget", () => {
    render(<Testimonials />);
    const quotes = screen.getAllByTestId("testimonial-quote");
    quotes.forEach((quote) => {
      expect(quote.textContent!.length).toBeLessThanOrEqual(180);
    });
  });

  it("attributes each quote with a real name and city, no em-dash", () => {
    render(<Testimonials />);
    const attributions = screen.getAllByTestId("testimonial-attribution");
    attributions.forEach((attribution) => {
      expect(attribution.textContent).toMatch(/,/);
      expect(attribution.textContent).not.toMatch(/—|–/);
    });
  });
});
