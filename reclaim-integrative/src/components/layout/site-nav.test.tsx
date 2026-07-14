import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteNav } from "./site-nav";

describe("SiteNav", () => {
  it("renders exactly three primary nav links plus one CTA", () => {
    render(<SiteNav />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.textContent)).toEqual(["Services", "About", "Contact"]);
  });

  it("renders exactly one CTA with the canonical booking label", () => {
    render(<SiteNav />);
    const ctas = screen.getAllByRole("button", { name: "Schedule Consultation" });
    expect(ctas).toHaveLength(1);
  });
});
