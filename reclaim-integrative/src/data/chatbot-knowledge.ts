// Compiles the chatbot's entire knowledge base from the site's existing
// typed data sources. No retrieval layer: the output is a few KB and rides
// in the system prompt on every request. Copy rules apply here too: plain
// hyphens only, never an em-dash.

import { CATEGORIES, LOCATIONS, SERVICES } from "./booking";
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
    "- Include at most one link per reply. Links must be chosen exactly from the links in this prompt and formatted as a markdown link, for example [Start your booking](/book).",
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
  ]
    .join("\n")
    // Some source copy (e.g. faqs.ts) still contains em-dashes pending the
    // site-wide content pass; the prompt must satisfy the copy rule regardless.
    .replace(/—/g, "-");
}
