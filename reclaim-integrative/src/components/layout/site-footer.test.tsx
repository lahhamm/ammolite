import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders both clinic locations", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/Newport Beach, CA 92660/)).toBeInTheDocument();
    expect(screen.getByText(/Rancho Cucamonga, CA 91730/)).toBeInTheDocument();
  });

  it("renders each clinic's hours, with the appointment-only note for Rancho Cucamonga", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText("Mon 8am-4pm · Tue 9am-12pm · Wed-Thu 8am-4pm · Fri 8am-3pm"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Thu 12pm-4pm · Sat 9am-12pm/)).toBeInTheDocument();
    expect(screen.getByText("By appointment only")).toBeInTheDocument();
  });

  it("renders the PHI email disclaimer", () => {
    render(<SiteFooter />);
    expect(
      screen.getByText(/protected health information/i),
    ).toBeInTheDocument();
    // The disclaimer must not leak an em-dash into visible copy.
    const disclaimer = screen.getByText(/protected health information/i);
    expect(disclaimer.textContent).not.toContain("—");
  });

  it("renders the six secondary nav links in order, with Press & Media for discoverability after it left the top nav", () => {
    render(<SiteFooter />);
    const nav = screen.getByRole("navigation");
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent?.trim())).toEqual([
      "Press & Media",
      "Memberships",
      "Journal",
      "Shop",
      "Conditions Treated",
      "FAQs",
    ]);
    expect(
      within(nav).getByRole("link", { name: "Press & Media" }),
    ).toHaveAttribute("href", "/press");
  });

  it("labels the phone, fax, and email contact rows with accessible icons, not decorative-only", () => {
    render(<SiteFooter />);
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Fax")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText(/Fax: \(949\) 629-6929/)).toBeInTheDocument();
  });

  it("gives online booking primary visual hierarchy with a Book an Appointment CTA to /book", () => {
    render(<SiteFooter />);
    const cta = screen.getByRole("link", { name: "Book an Appointment" });
    expect(cta).toHaveAttribute("href", "/book");
  });

  it("renders the booking band by default", () => {
    render(<SiteFooter />);
    expect(screen.getByText("Book your appointment online")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Book an Appointment" }),
    ).toBeInTheDocument();
  });

  it("omits the booking band when showBookingBand is false", () => {
    render(<SiteFooter showBookingBand={false} />);
    expect(
      screen.queryByText("Book your appointment online"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Book an Appointment" }),
    ).not.toBeInTheDocument();
    // The rest of the footer still renders.
    expect(screen.getByText(/Newport Beach, CA 92660/)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
