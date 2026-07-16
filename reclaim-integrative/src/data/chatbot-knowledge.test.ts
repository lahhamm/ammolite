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
