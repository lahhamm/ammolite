// Stateless chat endpoint: validates the client's transcript, prepends the
// compiled knowledge prompt, and re-emits the LLM's SSE stream as plain
// text chunks. Nothing is logged or stored; there are no cookies or ids.

import { buildSystemPrompt } from "@/data/chatbot-knowledge";

const MAX_MESSAGES = 10;
const MAX_CONTENT_LENGTH = 1000;
const UPSTREAM_TIMEOUT_MS = 20_000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function isValidMessage(m: unknown): m is ChatMessage {
  if (typeof m !== "object" || m === null) return false;
  const msg = m as Record<string, unknown>;
  return (
    (msg.role === "user" || msg.role === "assistant") &&
    typeof msg.content === "string" &&
    msg.content.length > 0 &&
    msg.content.length <= MAX_CONTENT_LENGTH
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = (body as Record<string, unknown> | null)?.messages;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isValidMessage)
  ) {
    return Response.json({ error: "Invalid messages" }, { status: 400 });
  }

  const apiKey = process.env.CHAT_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chat is not configured" }, { status: 503 });
  }
  const baseUrl = process.env.CHAT_BASE_URL || "https://api.deepseek.com";
  const model = process.env.CHAT_MODEL || "deepseek-chat";

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.3,
        max_tokens: 400,
        messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return Response.json({ error: "Upstream unavailable" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "Upstream error" }, { status: 502 });
  }

  const upstreamBody = upstream.body;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamBody.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const data = line.trim();
            if (!data.startsWith("data:")) continue;
            const payload = data.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const delta: unknown = JSON.parse(payload);
              const content = (delta as { choices?: { delta?: { content?: string } }[] })
                .choices?.[0]?.delta?.content;
              if (content) controller.enqueue(encoder.encode(content));
            } catch {
              // Ignore malformed SSE fragments.
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
