# AI Chatbot ("Reclaim assistant") — Design

**Date:** 2026-07-15
**Status:** Approved by Adam
**Scope:** Site-wide AI chat widget that answers visitor questions and guides people into the `/book` flow. Ships in the client demo (Vercel deploy); hardened post-signing.

## Goals

1. Answer visitor questions grounded strictly in the site's real content (services, hours, locations, FAQs, memberships, contact).
2. Guide visitors into booking via the existing `/book?service=…` / `/book?category=…` deep links.
3. Be another proof point in the demo: custom, premium, on-brand — not an embedded third-party widget.

**Non-goals (explicitly out of scope):** lead capture, full in-chat booking (date/time selection), transcript storage/analytics, GHL integration. These are post-signing candidates.

## Decisions already made

- **Approach:** custom widget + own Next.js API route. No third-party chat vendor, no vector DB / RAG — the full knowledge base is a few KB and rides in the system prompt on every request.
- **LLM provider (demo phase):** DeepSeek via its OpenAI-compatible API, using Adam's existing key. Provider is swappable via env vars only (`CHAT_API_KEY`, `CHAT_BASE_URL`, `CHAT_MODEL`) — post-signing hardening may swap to a BAA-signable vendor.
- **Stateless server:** no transcripts stored anywhere. This is the demo-phase HIPAA posture: nothing retained, plus a visible "don't share medical details" disclaimer.
- **Branch:** built on `reclaim-integrative-homepage` in the Developer worktree, same gates as all other work.

## 1. User experience

- Floating launcher button, bottom-right, all pages (mounted in root layout). **Not gold** — gold remains reserved for the Book an Appointment CTA (site hard rule: gold appears once).
- Open state: desktop = corner panel card; mobile (375px) = near-full-height bottom sheet, single-thumb usable, 44px+ tap targets.
- Header: "Reclaim assistant" + persistent disclaimer line: "AI assistant. For medical questions, please book a visit with Dr. Colon."
- Empty state: three starter chips — "What services do you offer?", "What are your hours?", "Where are you located?"
- Replies stream token-by-token; typing indicator while waiting.
- Booking guidance: when the bot recommends a service, the client renders an in-chat button deep-linking to `/book?service=…`. Button label must NOT duplicate "Book an Appointment" (site hard rule: no duplicate CTA label). Working label: "Start your booking".
- Copy rules apply to all bot-facing UI copy and the system prompt's canned phrases: no em-dashes, at most the site-wide eyebrow budget (i.e., none here).

## 2. Architecture

Three units:

### a. Knowledge builder — `src/data/chatbot-knowledge.ts`
- Pure function `buildSystemPrompt(): string` composing:
  - Persona + hard rules (see Guardrails)
  - Locations + hours from `src/data/hours.ts` (single source of truth — never hand-written)
  - Services + categories + their valid booking deep links from `src/data/booking.ts`
  - FAQs from `src/data/faqs.ts`
  - Memberships summary, contact info (phone/email/addresses)
- Also exports the whitelist of valid internal link paths (derived from the booking catalog + static pages) used by both the prompt and the client-side link renderer.

### b. API route — `src/app/api/chat/route.ts`
- `POST` with JSON body: `{ messages: [{role: 'user'|'assistant', content: string}] }`.
- Validation: reject non-array bodies, >10 messages (client also trims to last 10), any message >1000 chars, empty content. Returns 400 on violation.
- Calls the OpenAI-compatible chat completions endpoint (`CHAT_BASE_URL`, default `https://api.deepseek.com`; `CHAT_MODEL`, default `deepseek-chat`) with `stream: true`, temperature low (≤0.3), max output tokens capped (~400).
- Streams text back to the client (plain text stream; client appends as it arrives).
- No logging of message content. No cookies, no session identifiers.
- 20s upstream timeout → error response the client turns into the fallback bubble.

### c. Widget — `src/components/chat/`
- `chat-widget.tsx` — launcher + open/close state + panel shell (the only piece mounted in `src/app/layout.tsx`)
- `chat-panel.tsx` — header/disclaimer, message list, starter chips, composer
- Message rendering: plain text; markdown-style links from the model are parsed and rendered as styled buttons/links ONLY if the path is on the internal whitelist; everything else renders as inert text. No HTML from the model is ever injected.
- Client-side conversation state is in-memory only (resets on reload). Per-session cap: 20 user messages, after which the composer disables with a message pointing to `/contact` and the phone number.
- Respects `prefers-reduced-motion` for open/close animation, consistent with the site's motion usage.

## 3. Guardrails (system prompt hard rules)

Mirrors the Bland voice agent's rules, adapted for text:

- NEVER give medical advice, discuss symptoms, diagnoses, medications, dosages, or treatment suitability. Deflect: suggest booking a visit with Dr. Colon.
- NEVER state prices; pricing is discussed with the clinic.
- NEVER invent facts not present in the knowledge block; if unknown, say so and point to `/contact` or the phone number.
- Only discuss Reclaim Integrative topics; politely decline anything else.
- Keep answers short (2–4 sentences); include at most one booking link per reply, using only whitelisted paths.
- Remind users not to share personal medical details if they begin to.

## 4. Error handling

- API/network failure, timeout, or non-200: friendly fallback bubble with clinic phone number and `/contact` link. Never a raw error, never a dead spinner (loading state has a timeout).
- Composer disabled while a reply is streaming; empty input cannot send.

## 5. Testing

- `chatbot-knowledge.test.ts`: prompt contains both locations' hours verbatim from the hours source; every deep link in the whitelist resolves to a real catalog entry; no em-dashes anywhere in prompt copy; hard-rule phrases present.
- API route tests: 400s on oversized/malformed input; upstream called with expected model/env config (mocked fetch); no content logged.
- Component tests: launcher renders on pages via layout; panel opens/closes; starter chips send; disclaimer visible; whitelisted link renders as button, non-whitelisted link renders as text; session cap disables composer.
- Gates: full suite green (165 existing tests untouched), `npm run lint` 0 errors, production build passes, browser-verified desktop + 375px (no horizontal overflow, console clean).

## 6. Deployment notes

- Env vars set in Vercel project settings: `CHAT_API_KEY`, `CHAT_BASE_URL`, `CHAT_MODEL`. Key is server-side only — never exposed to the client bundle.
- If env vars are absent (e.g., local dev without a key), the widget still renders; sending returns the fallback bubble. The site must never break because chat is unconfigured.

## 7. Post-signing hardening (documented, not built now)

- Swap provider to a BAA-signable vendor (env-var change) + sign BAAs.
- Real rate limiting (per-IP, durable store) instead of the client-session cap.
- Optional transcript capture with consent + GHL lead handoff.
