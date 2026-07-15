import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./hero";

describe("Hero", () => {
  it("renders exactly one primary CTA linking to the booking flow (Hero Stack Discipline)", () => {
    render(<Hero />);
    const ctas = screen.getAllByRole("link", { name: "Book an Appointment" });
    expect(ctas).toHaveLength(1);
    expect(ctas[0]).toHaveAttribute("href", "/book");
    // The homepage hero CTA is the single gold accent on the entire site.
    expect(ctas[0].className).toContain("bg-accent-gold");
  });

  it("renders the phone number as a secondary tel link, not a button styled as a floating bubble", () => {
    render(<Hero />);
    const phone = screen.getByRole("link", { name: "(949) 423-3522" });
    expect(phone).toHaveAttribute("href", "tel:+19494233522");
    expect(phone.className).not.toContain("fixed");
    expect(phone.className).not.toContain("bg-");
  });

  it("contains no video element and no full-bleed background media", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("video")).toBeNull();
    expect(screen.queryByTestId("hero-video")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hero-background")).not.toBeInTheDocument();
  });

  it("renders a contained image box pointed at the hero asset", () => {
    render(<Hero />);
    const box = screen.getByTestId("hero-image-box");
    // Contained, rounded box rather than a full-bleed background.
    expect(box.className).toContain("rounded-2xl");
    expect(box.className).toContain("overflow-hidden");
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", expect.stringContaining("Reclaim Integrative"));
  });

  it("falls back to the styled placeholder when the hero image is missing", () => {
    render(<Hero />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    // The placeholder is decorative and stays inside the same styled box.
    expect(screen.getByTestId("hero-image-box")).toBeInTheDocument();
  });

  it("has no eyebrow element above the headline", () => {
    render(<Hero />);
    expect(screen.queryByTestId("eyebrow")).not.toBeInTheDocument();
  });
});
