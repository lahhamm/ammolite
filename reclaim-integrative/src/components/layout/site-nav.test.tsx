import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteNav } from "./site-nav";

describe("SiteNav", () => {
  it("renders exactly three primary nav links plus one CTA", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation");
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.textContent)).toEqual(["Services", "About", "Contact"]);
  });

  it("renders exactly one CTA with the canonical booking label", () => {
    render(<SiteNav />);
    const ctas = screen.getAllByRole("button", { name: "Schedule Consultation" });
    expect(ctas).toHaveLength(1);
  });

  it("renders a hamburger menu toggle button", () => {
    render(<SiteNav />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("reveals the 3 nav links in a mobile menu when the hamburger is clicked", () => {
    render(<SiteNav />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    const navs = screen.getAllByRole("navigation");
    expect(navs).toHaveLength(2);
    const mobileLinks = within(navs[1]).getAllByRole("link");
    expect(mobileLinks.map((l) => l.textContent)).toEqual(["Services", "About", "Contact"]);
  });

  it("still reveals the mobile nav links when transparent is true", () => {
    render(<SiteNav transparent />);

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const navs = screen.getAllByRole("navigation");
    const mobileLinks = within(navs[1]).getAllByRole("link");
    expect(mobileLinks.map((l) => l.textContent)).toEqual(["Services", "About", "Contact"]);
  });
});
