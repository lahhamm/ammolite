import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function sse(...deltas: string[]): Response {
  const lines =
    deltas
      .map((d) => `data: ${JSON.stringify({ choices: [{ delta: { content: d } }] })}\n`)
      .join("\n") + "\ndata: [DONE]\n";
  return new Response(lines, { status: 200 });
}

function req(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.stubEnv("CHAT_API_KEY", "test-key");
    vi.stubEnv("CHAT_BASE_URL", "https://api.test.example");
    vi.stubEnv("CHAT_MODEL", "test-model");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("400s on a malformed body", async () => {
    expect((await POST(req({}))).status).toBe(400);
    expect((await POST(req({ messages: "hi" }))).status).toBe(400);
    expect((await POST(req({ messages: [{ role: "user", content: "" }] }))).status).toBe(400);
    expect(
      (await POST(req({ messages: [{ role: "user", content: "x".repeat(1001) }] }))).status,
    ).toBe(400);
    const eleven = Array.from({ length: 11 }, () => ({ role: "user", content: "hi" }));
    expect((await POST(req({ messages: eleven }))).status).toBe(400);
  });

  it("503s when the API key is not configured", async () => {
    vi.stubEnv("CHAT_API_KEY", "");
    const res = await POST(req({ messages: [{ role: "user", content: "hi" }] }));
    expect(res.status).toBe(503);
  });

  it("streams upstream deltas back as plain text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sse("Hello ", "there"));
    vi.stubGlobal("fetch", fetchMock);
    const res = await POST(req({ messages: [{ role: "user", content: "hi" }] }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello there");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.test.example/chat/completions");
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent.model).toBe("test-model");
    expect(sent.stream).toBe(true);
    expect(sent.messages[0].role).toBe("system");
    expect(sent.messages[0].content).toContain("Reclaim assistant");
    expect(sent.messages[1]).toEqual({ role: "user", content: "hi" });
  });

  it("502s when upstream fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    const res = await POST(req({ messages: [{ role: "user", content: "hi" }] }));
    expect(res.status).toBe(502);
  });
});
