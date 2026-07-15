import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./hero";

describe("Hero", () => {
  it("renders exactly one primary CTA (Hero Stack Discipline)", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    const ctas = screen.getAllByRole("button", { name: "Book an Appointment" });
    expect(ctas).toHaveLength(1);
  });

  it("renders the phone number as a secondary text link, not a button styled as a floating bubble", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    const phone = screen.getByRole("button", { name: "(949) 423-3522" });
    expect(phone.className).not.toContain("fixed");
  });

  it("falls back to the poster image when no video source is provided yet", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    expect(screen.queryByTestId("hero-video")).not.toBeInTheDocument();
    expect(screen.getByTestId("hero-poster")).toBeInTheDocument();
  });

  it("has no eyebrow element above the headline", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    expect(screen.queryByTestId("eyebrow")).not.toBeInTheDocument();
  });
});
