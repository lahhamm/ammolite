"use client";

// The chat conversation surface: header with disclaimer, message list with
// starter chips, streaming display, session cap, and a fallback reply that
// never leaves the visitor staring at a raw error. Transcripts live only in
// component state; a reload clears them.

import { useEffect, useRef, useState } from "react";
import { PaperPlaneRight, X } from "@phosphor-icons/react";
import { MessageContent } from "./message-content";
import { CLINIC_PHONE } from "@/data/chatbot-knowledge";

export const STARTERS = [
  "What services do you offer?",
  "What are your hours?",
  "Where are you located?",
];

export const FALLBACK_REPLY = `Sorry, I could not respond just now. Please call us at ${CLINIC_PHONE} and our team will be happy to help.`;

export const MAX_USER_MESSAGES = 20;

export interface PanelMessage {
  role: "user" | "assistant";
  content: string;
}

export function canSend(messages: PanelMessage[]): boolean {
  return messages.filter((m) => m.role === "user").length < MAX_USER_MESSAGES;
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming || !canSend(messages)) return;
    const next: PanelMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      if (!res.ok || !res.body) throw new Error("chat request failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        const current = reply;
        setMessages([...next, { role: "assistant", content: current }]);
      }
      if (!reply.trim()) throw new Error("empty reply");
    } catch {
      setMessages([...next, { role: "assistant", content: FALLBACK_REPLY }]);
    } finally {
      setStreaming(false);
    }
  }

  const capped = !canSend(messages);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-xl bg-canvas shadow-2xl md:rounded-xl">
      <div className="flex items-start justify-between gap-3 bg-ink px-4 py-3 text-canvas">
        <div>
          <p className="font-serif text-lg">Reclaim assistant</p>
          <p className="text-xs text-canvas/70">
            AI assistant. For medical questions, please book a visit with Dr. Colon.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close chat"
          onClick={onClose}
          className="mt-1 rounded-sm p-1 transition-colors duration-200 hover:bg-canvas/10"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-ink/70">
              Hi! Ask me anything about Reclaim Integrative.
            </p>
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="block w-full rounded-sm border border-ink/15 px-3 py-2 text-left text-sm text-ink transition-colors duration-200 hover:border-ink/40"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-sm bg-ink px-3 py-2 text-sm text-canvas">
                {m.content}
              </p>
            </div>
          ) : (
            <div key={i} className="flex">
              <div className="max-w-[85%] rounded-sm bg-ink/5 px-3 py-2 text-sm text-ink">
                {m.content === "" && streaming && i === messages.length - 1 ? (
                  <span className="animate-pulse" aria-label="Assistant is typing">
                    ...
                  </span>
                ) : (
                  <MessageContent text={m.content} />
                )}
              </div>
            </div>
          ),
        )}
        {capped && (
          <p className="text-xs text-ink/60">
            That is the limit for this chat session. For anything else, call us at{" "}
            {CLINIC_PHONE}.
          </p>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-ink/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question"
          aria-label="Type your question"
          disabled={streaming || capped}
          maxLength={1000}
          className="flex-1 rounded-sm border border-ink/15 px-3 py-2 text-sm text-ink outline-none focus:border-ink/40 disabled:opacity-50"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={streaming || capped || input.trim() === ""}
          className="rounded-sm bg-ink p-2 text-canvas transition-colors duration-200 hover:bg-ink/85 disabled:opacity-40"
        >
          <PaperPlaneRight size={18} aria-hidden />
        </button>
      </form>
    </div>
  );
}
