import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders primary variant with charcoal background token", () => {
    render(<Button variant="primary">Book an Appointment</Button>);
    const button = screen.getByRole("button", { name: "Book an Appointment" });
    expect(button.className).toContain("bg-ink");
  });

  it("renders gold variant only when explicitly requested", () => {
    render(<Button variant="gold">Book an Appointment</Button>);
    const button = screen.getByRole("button", { name: "Book an Appointment" });
    expect(button.className).toContain("bg-accent-gold");
  });

  it("renders text variant as a plain link-style control with no background fill", () => {
    render(<Button variant="text">(949) 423-3522</Button>);
    const button = screen.getByRole("button", { name: "(949) 423-3522" });
    expect(button.className).not.toContain("bg-");
  });

  it("renders as a link with identical variant styling when href is provided", () => {
    render(
      <Button variant="primary" href="/book">
        Book an Appointment
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Book an Appointment" });
    expect(link).toHaveAttribute("href", "/book");
    expect(link.className).toContain("bg-ink");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders inverse variant for CTAs on dark backgrounds without reusing gold", () => {
    render(<Button variant="inverse">Book an Appointment</Button>);
    const button = screen.getByRole("button", { name: "Book an Appointment" });
    expect(button.className).toContain("border-canvas");
    expect(button.className).not.toContain("bg-accent-gold");
  });
});
