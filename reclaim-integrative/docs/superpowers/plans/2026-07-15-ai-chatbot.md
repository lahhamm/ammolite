# AI Chatbot ("Reclaim assistant") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site-wide AI chat widget that answers visitor questions from the site's real content and deep-links into `/book`, backed by a stateless streaming API route on DeepSeek.

**Architecture:** A pure knowledge-builder compiles the system prompt from existing typed data (`faqs.ts`, `hours.ts`, `booking.ts`). A stateless `POST /api/chat` route validates input, calls the OpenAI-compatible DeepSeek endpoint with `stream: true`, and re-emits plain-text chunks. Client components render a launcher + panel with whitelisted-internal-links-only rendering.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 tokens (`ink`, `canvas`, `accent-gold`), `motion/react`, Vitest + Testing Library.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-15-ai-chatbot-design.md`
- No em-dashes in any user-facing copy or prompt text (site hard rule).
- No new eyebrow labels; launcher/panel must NOT be gold (`accent-gold` reserved for Book an Appointment).
- No CTA labeled "Book an Appointment" inside chat (no duplicate CTA label rule); use "Start your booking".
- Server stores nothing; no logging of message content.
- There is NO `/contact` page (removed earlier); fallback copy uses phone `(949) 423-3522` only.
- Env vars: `CHAT_API_KEY`, `CHAT_BASE_URL` (default `https://api.deepseek.com`), `CHAT_MODEL` (default `deepseek-chat`). Key lives in `.env.local` (gitignored via `.env*`) and Vercel settings; never in git or the client bundle.
- Gates for every task: `npx vitest run <file>` green; final task runs full `npm test`, `npm run lint`, `npm run build`.
- All work on branch `reclaim-integrative-homepage` in `/Users/adamlahham/Developer/reclaim-integrative-homepage/reclaim-integrative`. Stage files by explicit path.

---

### Task 1: Knowledge builder + link whitelist

**Files:**
- Create: `src/data/chatbot-knowledge.ts`
- Test: `src/data/chatbot-knowledge.test.ts`

**Interfaces:**
- Produces: `buildSystemPrompt(): string`, `INTERNAL_LINKS: string[]`, `isAllowedLink(path: string): boolean`, `CLINIC_PHONE = "(949) 423-3522"`.

- [ ] **Step 1: Write the failing test** (`src/data/chatbot-knowledge.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt,
  CLINIC_PHONE,
  INTERNAL_LINKS,
  isAllowedLink,
} from "./chatbot-knowledge";
import { CATEGORIES, SERVICES } from "./booking";
import { hoursSummaryLine } from "./hours";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("includes both locations' hours verbatim from the hours source", () => {
    expect(prompt).toContain(hoursSummaryLine("newport-beach"));
    expect(prompt).toContain(hoursSummaryLine("rancho-cucamonga"));
    expect(prompt).toContain("By appointment only");
  });

  it("includes every bookable service name and its deep link", () => {
    for (const s of SERVICES) {
      expect(prompt).toContain(s.name);
      expect(prompt).toContain(`/book?service=${s.slug}`);
    }
  });

  it("includes FAQ answers and the clinic phone", () => {
    expect(prompt).toContain("Naturopathic Medicine emphasizes prevention");
    expect(prompt).toContain(CLINIC_PHONE);
  });

  it("contains no em-dashes and states the hard rules", () => {
    expect(prompt).not.toContain("—");
    expect(prompt.toLowerCase()).toContain("never give medical advice");
    expect(prompt.toLowerCase()).toContain("never state prices");
  });
});

describe("isAllowedLink", () => {
  it("allows static pages, service and category deep links", () => {
    expect(isAllowedLink("/book")).toBe(true);
    expect(isAllowedLink(`/book?service=${SERVICES[0].slug}`)).toBe(true);
    expect(isAllowedLink(`/book?category=${CATEGORIES[0].id}`)).toBe(true);
    expect(isAllowedLink("/services")).toBe(true);
  });

  it("rejects external and unknown paths", () => {
    expect(isAllowedLink("https://evil.example.com")).toBe(false);
    expect(isAllowedLink("/admin")).toBe(false);
    expect(isAllowedLink("/contact")).toBe(false);
  });

  it("whitelist entries are unique", () => {
    expect(new Set(INTERNAL_LINKS).size).toBe(INTERNAL_LINKS.length);
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run src/data/chatbot-knowledge.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement** (`src/data/chatbot-knowledge.ts`)

```ts
// Compiles the chatbot's entire knowledge base from the site's existing
// typed data sources. No retrieval layer: the output is a few KB and rides
// in the system prompt on every request. Copy rules apply here too: plain
// hyphens only, never an em-dash.

import { CATEGORIES, LOCATIONS, SERVICES, getCategoryById } from "./booking";
import { faqs } from "./faqs";
import { hoursSummaryLine, noteFor } from "./hours";

export const CLINIC_PHONE = "(949) 423-3522";

const STATIC_PAGES = [
  "/book",
  "/services",
  "/about",
  "/memberships",
  "/journal",
  "/shop",
  "/faqs",
  "/press",
  "/conditions-treated",
];

export const INTERNAL_LINKS: string[] = [
  ...STATIC_PAGES,
  ...SERVICES.map((s) => `/book?service=${s.slug}`),
  ...CATEGORIES.map((c) => `/book?category=${c.id}`),
];

const LINK_SET = new Set(INTERNAL_LINKS);

export function isAllowedLink(path: string): boolean {
  return LINK_SET.has(path);
}

function locationBlock(): string {
  return LOCATIONS.map((loc) => {
    const note = noteFor(loc.id);
    return [
      `${loc.name}: ${loc.address}.`,
      `Hours: ${hoursSummaryLine(loc.id)}.${note ? ` ${note}.` : ""}`,
    ].join(" ");
  }).join("\n");
}

function servicesBlock(): string {
  return CATEGORIES.map((cat) => {
    const rows = SERVICES.filter((s) => s.category === cat.id)
      .map((s) => `- ${s.name}: link [Start your booking](/book?service=${s.slug})`)
      .join("\n");
    return `${cat.name} (${cat.description})\n${rows}`;
  }).join("\n\n");
}

function faqBlock(): string {
  return faqs
    .map(
      (group) =>
        `${group.category}\n` +
        group.questions.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n"),
    )
    .join("\n\n");
}

export function buildSystemPrompt(): string {
  return [
    "You are the Reclaim assistant, the website chat assistant for Reclaim Integrative Medicine, the naturopathic practice of Dr. Andrea Colon in Southern California.",
    "",
    "VOICE: warm, calm, and concise. Two to four short sentences per reply. Plain language. Use only regular hyphens, never long dashes.",
    "",
    "HARD RULES:",
    "- NEVER give medical advice. Never discuss symptoms, diagnoses, medications, dosages, or whether a treatment is right for someone. For anything clinical, suggest booking a visit with Dr. Colon.",
    "- NEVER state prices. Say pricing is discussed with the clinic based on your personalized plan.",
    `- NEVER invent facts that are not in this knowledge base. If you do not know, say so and share the clinic phone number ${CLINIC_PHONE}.`,
    "- Only discuss Reclaim Integrative topics. Politely decline anything else.",
    "- Include at most one link per reply. Links must be chosen exactly from the ALLOWED LINKS in this prompt and formatted as a markdown link, for example [Start your booking](/book).",
    "- If a visitor starts sharing personal medical details, gently remind them that this chat is not the place for medical information and suggest a visit instead.",
    "",
    "LOCATIONS AND HOURS:",
    locationBlock(),
    "",
    "SERVICES (each with its booking link):",
    servicesBlock(),
    "",
    "FREQUENTLY ASKED QUESTIONS:",
    faqBlock(),
    "",
    `BOOKING: visitors book online at [Start your booking](/book), or can call ${CLINIC_PHONE}.`,
    `CONTACT: phone ${CLINIC_PHONE}.`,
  ].join("\n");
}
```

Note: `getCategoryById` import only if used; drop unused imports to keep lint clean.

- [ ] **Step 4: Run to verify pass** — `npx vitest run src/data/chatbot-knowledge.test.ts` → PASS.
- [ ] **Step 5: Commit** — `git add src/data/chatbot-knowledge.ts src/data/chatbot-knowledge.test.ts && git commit -m "feat: chatbot knowledge builder and link whitelist"`

---

### Task 2: Streaming chat API route + env

**Files:**
- Create: `src/app/api/chat/route.ts`, `.env.local` (NOT committed; `.env*` is gitignored)
- Test: `src/app/api/chat/route.test.ts`

**Interfaces:**
- Consumes: `buildSystemPrompt()` from Task 1.
- Produces: `POST /api/chat` accepting `{ messages: {role: "user"|"assistant", content: string}[] }` (max 10 messages, each ≤1000 chars), returning a plain-text stream of the reply. Errors: 400 invalid input, 503 unconfigured, 502 upstream failure.

- [ ] **Step 1: Create `.env.local`** in the worktree root:

```
CHAT_API_KEY=<the DeepSeek key Adam provided>
CHAT_BASE_URL=https://api.deepseek.com
CHAT_MODEL=deepseek-chat
```

Verify `git status` does NOT list `.env.local`.

- [ ] **Step 2: Write the failing test** (`src/app/api/chat/route.test.ts`)

```ts
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
```

- [ ] **Step 3: Run to verify fail** — `npx vitest run src/app/api/chat/route.test.ts` → FAIL.

- [ ] **Step 4: Implement** (`src/app/api/chat/route.ts`)

```ts
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
```

- [ ] **Step 5: Run to verify pass** — `npx vitest run src/app/api/chat/route.test.ts` → PASS.
- [ ] **Step 6: Commit** — `git add src/app/api/chat/route.ts src/app/api/chat/route.test.ts && git commit -m "feat: stateless streaming chat API route"`

---

### Task 3: Message content renderer (whitelisted links only)

**Files:**
- Create: `src/components/chat/message-content.tsx`
- Test: `src/components/chat/message-content.test.tsx`

**Interfaces:**
- Consumes: `isAllowedLink` from Task 1.
- Produces: `parseSegments(text: string): Segment[]` where `Segment = { kind: "text"; text: string } | { kind: "link"; label: string; href: string }`; `<MessageContent text={string} />` React component.

- [ ] **Step 1: Write the failing test** (`src/components/chat/message-content.test.tsx`)

```tsx
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
```

- [ ] **Step 2: Run to verify fail.**
- [ ] **Step 3: Implement** (`src/components/chat/message-content.tsx`)

```tsx
// Renders a bot reply. The model can only produce clickable UI through the
// markdown-link syntax, and only for paths on the internal whitelist;
// everything else renders as inert text. No HTML from the model is ever
// injected.

import Link from "next/link";
import { isAllowedLink } from "@/data/chatbot-knowledge";

export type Segment =
  | { kind: "text"; text: string }
  | { kind: "link"; label: string; href: string };

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

export function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", text: text.slice(lastIndex, match.index) });
    }
    segments.push({ kind: "link", label: match[1], href: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ kind: "text", text: text.slice(lastIndex) });
  }
  return segments;
}

export function MessageContent({ text }: { text: string }) {
  return (
    <>
      {parseSegments(text).map((seg, i) =>
        seg.kind === "link" && isAllowedLink(seg.href) ? (
          <Link
            key={i}
            href={seg.href}
            className="mt-2 inline-block rounded-sm bg-ink px-4 py-2 text-sm text-canvas transition-colors duration-200 hover:bg-ink/85"
          >
            {seg.label}
          </Link>
        ) : (
          <span key={i}>{seg.kind === "link" ? seg.label : seg.text}</span>
        ),
      )}
    </>
  );
}
```

- [ ] **Step 4: Run to verify pass.**
- [ ] **Step 5: Commit** — `git add src/components/chat/message-content.tsx src/components/chat/message-content.test.tsx && git commit -m "feat: chat message renderer with link whitelist"`

---

### Task 4: Chat panel (state, streaming, chips, cap, fallback)

**Files:**
- Create: `src/components/chat/chat-panel.tsx`
- Test: `src/components/chat/chat-panel.test.tsx`

**Interfaces:**
- Consumes: `MessageContent` (Task 3), `CLINIC_PHONE` (Task 1).
- Produces: `<ChatPanel onClose={() => void} />`; exports `STARTERS: string[]`, `FALLBACK_REPLY: string`, `MAX_USER_MESSAGES = 20`, `canSend(messages: PanelMessage[]): boolean` for testability. `PanelMessage = { role: "user" | "assistant"; content: string }`.

Key behaviors (all in the component):
- Empty state shows the disclaimer and three starter chips (`STARTERS = ["What services do you offer?", "What are your hours?", "Where are you located?"]`); clicking a chip sends it as a user message.
- `send(text)`: trims; appends user message + empty assistant placeholder; POSTs `{ messages: transcript.slice(-10) }` (user/assistant only) to `/api/chat`; reads `response.body` via `getReader()`, appending decoded chunks to the placeholder as they arrive (streaming display).
- Any fetch error, non-200, or missing body sets the placeholder to `FALLBACK_REPLY = "Sorry, I could not respond just now. Please call us at (949) 423-3522 and our team will be happy to help."`
- Composer disabled while streaming and when `canSend` is false (`canSend` = user-message count < `MAX_USER_MESSAGES`); at cap, show a quiet line pointing to the phone number.
- Header: "Reclaim assistant" + disclaimer line "AI assistant. For medical questions, please book a visit with Dr. Colon." + close button (aria-label "Close chat").
- Auto-scroll message list to bottom on new content (ref + `scrollTop = scrollHeight` in an effect).

- [ ] **Step 1: Write the failing test** (`src/components/chat/chat-panel.test.tsx`)

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { canSend, ChatPanel, FALLBACK_REPLY, MAX_USER_MESSAGES, STARTERS } from "./chat-panel";

function textStream(text: string): Response {
  return new Response(text, { status: 200 });
}

afterEach(() => vi.restoreAllMocks());

describe("ChatPanel", () => {
  it("shows disclaimer and starter chips in the empty state", () => {
    render(<ChatPanel onClose={() => {}} />);
    expect(screen.getByText(/AI assistant\. For medical questions/)).toBeInTheDocument();
    for (const s of STARTERS) expect(screen.getByRole("button", { name: s })).toBeInTheDocument();
  });

  it("sends a chip question and renders the streamed reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue(textStream("We offer IV therapy."));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ChatPanel onClose={() => {}} />);
    await user.click(screen.getByRole("button", { name: STARTERS[0] }));
    await waitFor(() => expect(screen.getByText("We offer IV therapy.")).toBeInTheDocument());
    const sent = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(sent.messages).toEqual([{ role: "user", content: STARTERS[0] }]);
  });

  it("shows the fallback reply when the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("err", { status: 502 })));
    const user = userEvent.setup();
    render(<ChatPanel onClose={() => {}} />);
    await user.click(screen.getByRole("button", { name: STARTERS[1] }));
    await waitFor(() => expect(screen.getByText(FALLBACK_REPLY)).toBeInTheDocument());
  });

  it("calls onClose from the header button", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ChatPanel onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Close chat" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("canSend", () => {
  it("enforces the session cap on user messages", () => {
    const many = Array.from({ length: MAX_USER_MESSAGES }, () => ({
      role: "user" as const,
      content: "hi",
    }));
    expect(canSend(many.slice(0, MAX_USER_MESSAGES - 1))).toBe(true);
    expect(canSend(many)).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify fail.**
- [ ] **Step 3: Implement** `chat-panel.tsx` per the behaviors above ("use client"; plain React state; Work Sans body text; ink header on canvas panel; no gold anywhere).
- [ ] **Step 4: Run to verify pass.**
- [ ] **Step 5: Commit** — `git add src/components/chat/chat-panel.tsx src/components/chat/chat-panel.test.tsx && git commit -m "feat: chat panel with streaming, chips, cap and fallback"`

---

### Task 5: Launcher widget + layout mount

**Files:**
- Create: `src/components/chat/chat-widget.tsx`
- Modify: `src/app/layout.tsx` (mount `<ChatWidget />` after `<MobileStickyCta />`)
- Test: `src/components/chat/chat-widget.test.tsx`

**Interfaces:**
- Consumes: `ChatPanel` (Task 4).
- Produces: `<ChatWidget />` — self-contained; the only chat export the layout touches.

Key behaviors:
- Fixed launcher button bottom-right: `fixed right-4 bottom-24 md:bottom-6 md:right-6 z-50` (bottom-24 on mobile clears the MobileStickyCta bar; verify visually and adjust). Charcoal `bg-ink text-canvas` circular button with a chat icon (Phosphor `ChatCircleDots`), `aria-label="Open chat"`, 48px min size.
- Open state renders `ChatPanel` (mobile: `fixed inset-x-0 bottom-0 h-[85dvh] rounded-t-xl`; desktop: `md:inset-auto md:right-6 md:bottom-6 md:h-[32rem] md:w-96 md:rounded-xl`), launcher hidden while open.
- Open/close animated with `motion/react` (`AnimatePresence`, fade+rise ~200ms), gated by `useReducedMotion`.

- [ ] **Step 1: Write the failing test** (`src/components/chat/chat-widget.test.tsx`)

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChatWidget } from "./chat-widget";

describe("ChatWidget", () => {
  it("renders only the launcher initially", () => {
    render(<ChatWidget />);
    expect(screen.getByRole("button", { name: "Open chat" })).toBeInTheDocument();
    expect(screen.queryByText("Reclaim assistant")).toBeNull();
  });

  it("opens the panel on launch and closes from the panel", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole("button", { name: "Open chat" }));
    expect(screen.getByText("Reclaim assistant")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close chat" }));
    expect(screen.queryByText("Reclaim assistant")).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify fail.**
- [ ] **Step 3: Implement `chat-widget.tsx`; add `<ChatWidget />` to `src/app/layout.tsx` after `<MobileStickyCta />` with an import from `@/components/chat/chat-widget`.**
- [ ] **Step 4: Run to verify pass** (widget test + existing layout-dependent tests).
- [ ] **Step 5: Commit** — `git add src/components/chat/chat-widget.tsx src/components/chat/chat-widget.test.tsx src/app/layout.tsx && git commit -m "feat: mount site-wide chat widget"`

---

### Task 6: Full gates + live browser verification

- [ ] **Step 1:** `npm test` → all green (baseline 165 + new). `npm run lint` → 0 errors. `npm run build` → succeeds, `/api/chat` listed as a dynamic route.
- [ ] **Step 2:** Run the dev server from the Developer worktree (NOT the stale Desktop copy — verify with `lsof` which cwd the Next process has). Desktop width: open panel, click a starter chip, verify a real streamed DeepSeek answer grounded in site facts (ask "are you open Saturdays in Rancho Cucamonga?" → must say yes, 9am-12pm, appointment only). Ask a medical question ("how much semaglutide should I take?") → must deflect to booking a visit. Verify a booking link renders as a button and navigates into `/book` with the service preselected.
- [ ] **Step 3:** 375px: panel is a bottom sheet, single-thumb usable, no horizontal overflow (`document.documentElement.scrollWidth === 375`), launcher does not cover the MobileStickyCta, console clean.
- [ ] **Step 4:** Screenshot desktop + mobile as evidence. Update vault docs ([[Build Progress & Plan]] session note + [[Overview]] quick status).
- [ ] **Step 5:** Final commit of any doc changes.
