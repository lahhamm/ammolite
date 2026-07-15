import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteNav } from "./site-nav";

// Desktop nav renders the 6 primary destinations; the Services item exposes a
// dropdown whose 2 sublinks are always in the DOM (revealed on hover/focus).
const EXPECTED_DESKTOP_LINKS = [
  "Services",
  "Our Services",
  "Conditions Treated",
  "Memberships",
  "About",
  "Press",
  "Journal",
  "Shop",
];

// Mobile menu flattens Services into a labelled group, so the group heading is
// a plain span and only the sublinks are anchors. The booking CTA renders as
// a link at the end of the menu.
const EXPECTED_MOBILE_LINKS = [
  "Our Services",
  "Conditions Treated",
  "Memberships",
  "About",
  "Press",
  "Journal",
  "Shop",
  "Book an Appointment",
];

describe("SiteNav", () => {
  it("renders the six primary destinations plus the Services dropdown sublinks", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation");
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(EXPECTED_DESKTOP_LINKS.length);
    expect(links.map((l) => l.textContent?.trim())).toEqual(EXPECTED_DESKTOP_LINKS);
  });

  it("marks the Services item as a dropdown trigger", () => {
    render(<SiteNav />);
    const nav = screen.getByRole("navigation");
    const servicesLink = within(nav)
      .getAllByRole("link")
      .find((l) => l.textContent?.trim() === "Services");
    expect(servicesLink).toHaveAttribute("aria-haspopup", "true");
    expect(servicesLink).toHaveAttribute("aria-expanded", "false");
  });

  it("always renders the Book an Appointment CTA linking to the booking flow", () => {
    // The transparent-over-video variant was removed with the video hero;
    // the nav is solid everywhere and the desktop CTA is always present.
    render(<SiteNav />);
    const ctas = screen.getAllByRole("link", { name: "Book an Appointment" });
    expect(ctas).toHaveLength(1); // Only desktop is rendered when menu is closed
    expect(ctas[0]).toHaveAttribute("href", "/book");
  });

  it("renders a hamburger menu toggle button", () => {
    render(<SiteNav />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("reveals the full link set in a mobile menu when the hamburger is clicked", () => {
    render(<SiteNav />);
    const menuButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(menuButton);

    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    const navs = screen.getAllByRole("navigation");
    expect(navs).toHaveLength(2); // Desktop nav + Mobile nav
    const mobileNav = navs[1];
    // Services renders as a group heading, not a link, in the mobile menu.
    expect(within(mobileNav).getByText("Services")).toBeInTheDocument();
    const mobileLinks = within(mobileNav).getAllByRole("link");
    expect(mobileLinks.map((l) => l.textContent?.trim())).toEqual(EXPECTED_MOBILE_LINKS);
    // Mobile menu carries its own CTA linking to the booking flow.
    expect(
      within(mobileNav).getByRole("link", { name: "Book an Appointment" }),
    ).toHaveAttribute("href", "/book");
  });

  it("gives the mobile menu toggle a 44px tap target", () => {
    render(<SiteNav />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle.className).toContain("h-11");
    expect(toggle.className).toContain("w-11");
  });
});
