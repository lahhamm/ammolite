import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders both clinic locations", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/Newport Beach, CA 92660/)).toBeInTheDocument();
    expect(screen.getByText(/Rancho Cucamonga, CA 91730/)).toBeInTheDocument();
  });

  it("renders the five secondary nav links in order", () => {
    render(<SiteFooter />);
    const nav = screen.getByRole("navigation");
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent?.trim())).toEqual([
      "Memberships",
      "Journal",
      "Shop",
      "Conditions Treated",
      "FAQs",
    ]);
  });

  it("labels the phone and email contact rows with accessible icons, not decorative-only", () => {
    render(<SiteFooter />);
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
