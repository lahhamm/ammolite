import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatWidget } from "./chat-widget";

describe("ChatWidget", () => {
  it("renders only the launcher initially", () => {
    render(<ChatWidget />);
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
    expect(screen.queryByText("Reclaim assistant")).toBeNull();
  });

  it("opens the panel on launch and closes from the panel", async () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    expect(screen.getByText("Reclaim assistant")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close chat" }));
    // AnimatePresence unmounts after the exit animation completes.
    await waitFor(() => expect(screen.queryByText("Reclaim assistant")).toBeNull());
  });
});
