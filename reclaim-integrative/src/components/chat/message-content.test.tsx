import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageContent, parseSegments } from "./message-content";

describe("parseSegments", () => {
  it("splits text and markdown links", () => {
    expect(parseSegments("See [Start your booking](/book) today")).toEqual([
      { kind: "text", text: "See " },
      { kind: "link", label: "Start your booking", href: "/book" },
      { kind: "text", text: " today" },
    ]);
  });

  it("returns plain text untouched", () => {
    expect(parseSegments("Just words")).toEqual([{ kind: "text", text: "Just words" }]);
  });
});

describe("MessageContent", () => {
  it("renders whitelisted links as internal links", () => {
    render(<MessageContent text="Go [Start your booking](/book)" />);
    const link = screen.getByRole("link", { name: "Start your booking" });
    expect(link).toHaveAttribute("href", "/book");
  });

  it("renders non-whitelisted links as inert text, never anchors", () => {
    render(<MessageContent text="Bad [click me](https://evil.example.com) stuff" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/click me/)).toBeInTheDocument();
  });
});
