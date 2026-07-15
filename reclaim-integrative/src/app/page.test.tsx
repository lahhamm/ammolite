import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders all sections in order", () => {
    render(<HomePage />);
    expect(screen.getByText(/root-cause care/i)).toBeInTheDocument();
    expect(screen.getAllByText("Good Housekeeping").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/root cause/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Care built around you")).toBeInTheDocument();
    expect(screen.getByText("Patient Stories")).toBeInTheDocument();
    expect(screen.getByText(/take the first step/i)).toBeInTheDocument();
  });

  it("uses the canonical booking CTA label everywhere and never a variant (No Duplicate CTA Intent)", () => {
    render(<HomePage />);
    const bookingLinks = screen.getAllByRole("link", { name: "Book an Appointment" });
    expect(bookingLinks.length).toBeGreaterThan(0);
    bookingLinks.forEach((link) => {
      expect(link.getAttribute("href")).toMatch(/^\/book/);
    });
    expect(screen.queryByText(/book now/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/schedule online/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/let's talk/i)).not.toBeInTheDocument();
  });

  it("uses at most one eyebrow-style label across the whole page (Eyebrow Restraint)", () => {
    render(<HomePage />);
    expect(screen.queryAllByTestId("eyebrow").length).toBeLessThanOrEqual(1);
  });
});
