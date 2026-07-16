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
