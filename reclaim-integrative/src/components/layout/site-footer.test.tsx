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
