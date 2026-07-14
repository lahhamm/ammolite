import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroScrollTransition } from "./hero-scroll-transition";

describe("HeroScrollTransition", () => {
  it("renders both the hero and press logo wall children", () => {
    const { getByText } = render(
      <HeroScrollTransition hero={<p>Hero content</p>} pressLogoWall={<p>Press content</p>} />
    );
    expect(getByText("Hero content")).toBeInTheDocument();
    expect(getByText("Press content")).toBeInTheDocument();
  });

  it("unmounts cleanly without throwing (GSAP context cleanup)", () => {
    const { unmount } = render(
      <HeroScrollTransition hero={<p>Hero content</p>} pressLogoWall={<p>Press content</p>} />
    );
    expect(() => unmount()).not.toThrow();
  });
});
