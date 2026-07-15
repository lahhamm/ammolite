import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteNav } from "./site-nav";

const EXPECTED_LINKS = ["Home", "Services", "About", "As Seen In", "Contact"];

describe("SiteNav", () => {
  it("renders exactly five primary nav links plus one CTA", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation");
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map((l) => l.textContent)).toEqual(EXPECTED_LINKS);
  });

  it("renders the Book an Appointment CTA", () => {
    render(<SiteNav />);
    const ctas = screen.getAllByRole("button", { name: "Book an Appointment" });
    expect(ctas).toHaveLength(1); // Only desktop is rendered when menu is closed
  });

  it("does not render the desktop CTA when transparent is true", () => {
    render(<SiteNav transparent={true} />);
    // On transparent mode, desktop CTA is hidden. Mobile CTA only shows when menu is open.
    // Menu is closed by default. So 0 CTAs should be visible initially.
    const ctas = screen.queryAllByRole("button", { name: "Book an Appointment" });
    expect(ctas).toHaveLength(0);
  });

  it("renders a hamburger menu toggle button", () => {
    render(<SiteNav />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("reveals the 5 nav links in a mobile menu when the hamburger is clicked", () => {
    render(<SiteNav />);
    const menuButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(menuButton);

    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    const navs = screen.getAllByRole("navigation");
    expect(navs).toHaveLength(2); // Desktop nav + Mobile nav
    const mobileLinks = within(navs[1]).getAllByRole("link");
    expect(mobileLinks.map((l) => l.textContent)).toEqual(EXPECTED_LINKS);
  });

  it("still reveals the mobile nav links when transparent is true", () => {
    render(<SiteNav transparent={true} />);
    const menuButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(menuButton);

    const navs = screen.getAllByRole("navigation");
    const mobileLinks = within(navs[1]).getAllByRole("link");
    expect(mobileLinks.map((l) => l.textContent)).toEqual(EXPECTED_LINKS);
  });
});
