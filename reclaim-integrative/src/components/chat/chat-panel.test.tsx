import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canSend,
  ChatPanel,
  FALLBACK_REPLY,
  MAX_USER_MESSAGES,
  STARTERS,
  type PanelMessage,
} from "./chat-panel";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ChatPanel", () => {
  it("shows disclaimer and starter chips in the empty state", () => {
    render(<ChatPanel onClose={() => {}} />);
    expect(screen.getByText(/AI assistant\. For medical questions/)).toBeInTheDocument();
    for (const s of STARTERS) {
      expect(screen.getByRole("button", { name: s })).toBeInTheDocument();
    }
  });

  it("sends a chip question and renders the streamed reply", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("We offer IV therapy.", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatPanel onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: STARTERS[0] }));
    await waitFor(() =>
      expect(screen.getByText("We offer IV therapy.")).toBeInTheDocument(),
    );
    const sent = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(sent.messages).toEqual([{ role: "user", content: STARTERS[0] }]);
  });

  it("shows the fallback reply when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("err", { status: 502 })),
    );
    render(<ChatPanel onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: STARTERS[1] }));
    await waitFor(() => expect(screen.getByText(FALLBACK_REPLY)).toBeInTheDocument());
  });

  it("calls onClose from the header button", () => {
    const onClose = vi.fn();
    render(<ChatPanel onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close chat" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("canSend", () => {
  it("enforces the session cap on user messages", () => {
    const many: PanelMessage[] = Array.from({ length: MAX_USER_MESSAGES }, () => ({
      role: "user" as const,
      content: "hi",
    }));
    expect(canSend(many.slice(0, MAX_USER_MESSAGES - 1))).toBe(true);
    expect(canSend(many)).toBe(false);
  });
});
