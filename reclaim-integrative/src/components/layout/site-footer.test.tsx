import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders both clinic locations", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/Newport Beach, CA 92660/)).toBeInTheDocument();
    expect(screen.getByText(/Rancho Cucamonga, CA 91730/)).toBeInTheDocument();
  });

  it("renders the secondary nav items moved out of the primary nav", () => {
    render(<SiteFooter />);
    ["Memberships", "Shop", "Conditions Treated", "What to Expect"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("labels the phone and email contact rows with accessible icons, not decorative-only", () => {
    render(<SiteFooter />);
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
