import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./hero";

describe("Hero", () => {
  it("renders exactly one primary CTA linking to the booking flow (Hero Stack Discipline)", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    const ctas = screen.getAllByRole("link", { name: "Book an Appointment" });
    expect(ctas).toHaveLength(1);
    expect(ctas[0]).toHaveAttribute("href", "/book");
    // The homepage hero CTA is the single gold accent on the entire site.
    expect(ctas[0].className).toContain("bg-accent-gold");
  });

  it("renders the phone number as a secondary tel link, not a button styled as a floating bubble", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    const phone = screen.getByRole("link", { name: "(949) 423-3522" });
    expect(phone).toHaveAttribute("href", "tel:+19494233522");
    expect(phone.className).not.toContain("fixed");
    expect(phone.className).not.toContain("bg-");
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
