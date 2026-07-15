import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileStickyCta } from "./mobile-sticky-cta";

const usePathnameMock = vi.fn<() => string>(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, writable: true });
  act(() => {
    fireEvent.scroll(window);
  });
}

describe("MobileStickyCta", () => {
  it("appears after scrolling and links to the booking flow", () => {
    usePathnameMock.mockReturnValue("/");
    render(<MobileStickyCta />);
    expect(
      screen.queryByRole("link", { name: "Book an Appointment" }),
    ).not.toBeInTheDocument();
    scrollTo(400);
    const cta = screen.getByRole("link", { name: "Book an Appointment" });
    expect(cta).toHaveAttribute("href", "/book");
  });

  it("never renders on the booking flow itself, where the summary bar lives", () => {
    usePathnameMock.mockReturnValue("/book");
    render(<MobileStickyCta />);
    scrollTo(400);
    expect(
      screen.queryByRole("link", { name: "Book an Appointment" }),
    ).not.toBeInTheDocument();
  });
});
