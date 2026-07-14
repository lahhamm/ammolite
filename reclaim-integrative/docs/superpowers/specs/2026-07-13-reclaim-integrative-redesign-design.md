# Reclaim Integrative Medicine — Redesign Design Spec

**Date:** 2026-07-13
**Client:** Reclaim Integrative Medicine (naturopathic/integrative medicine practice, Newport Beach + Rancho Cucamonga, CA)
**Current site:** reclaimintegrative.com
**Build destiny:** This becomes the real production site if the client signs — not a throwaway pitch demo. Stack and code-quality decisions below reflect that.

## 1. Why this redesign

Reclaim Integrative has genuine substance: real testimonials, major earned press (GQ, Marie Claire, Good Housekeeping, Yahoo Health, 7 podcast features, 3B+ media impressions, 117M+ monthly readers reached), two real clinic locations, and a clear service taxonomy (hormone replacement, IV therapy, peptide therapy, digestive health, EBOO, BEMER). The execution is generic med-spa template: teal + burnt-orange/terracotta palette, four separate homepage sections built from the same undifferentiated white card component, a hero with 7+ competing elements above the fold, a 12-card press wall that dilutes its own two strongest placements, broken icon assets, and an emoji in a heading ("✨ BEMER THERAPY ✨"). The content is the asset; the execution is the gap.

## 2. Audit findings (current site)

Preserve:
- Real, specific testimonials (name, city, service tag)
- Legitimate press credibility with real stats
- Clear service taxonomy, two real locations
- Newport Beach coastal setting already signals the right locale

Fails, mapped to the `premium` skill's checklist:
- **Hero test:** press ticker + nav + location badge pill + wordmark + script subtitle + paragraph + CTA + floating phone bubble = 7+ competing elements before scrolling
- **Loudness/consistency test:** entire homepage built from the same white-card component four times (services, testimonials, press, BEMER benefits) — no macro hierarchy
- **Restraint test:** 12+ near-identical press cards dilute the two genuinely strong placements (GQ, Marie Claire)
- **Trend/consistency test:** teal + terracotta is a default wellness-template palette; the EBOO section's blue gradient banner clashes with the rest of the page
- **Micro-detail test:** broken/blank icon circles above service cards, literal emoji in a heading
- **Redundant CTAs:** sticky nav CTA + hero CTA + floating call bubble all compete simultaneously

## 3. Scope

Multi-page (confirmed over single-page): this is a real medical practice where SEO is likely the primary lead channel — distinct pages ranking for service- and condition-specific, location-specific queries matter more than a single persuasive scroll. Collapsing to one page would regress real search visibility.

This build phase covers four templates, proving the full system:
1. **Homepage**
2. **Services / Treatments**
3. **Contact / Book**
4. **As Seen In** (press)

Remaining pages in Reclaim's existing IA (Conditions Treated, What to Expect, Memberships, About Us) follow the same established templates once this direction is approved — not custom-designed individually in this phase.

## 4. Visual system

**Direction:** Coastal Clinical Minimalism (chosen over Editorial Wellness Journal and Quiet Luxury Spa Hybrid alternatives) — calm authority. Leans into restraint per the `premium` skill's guidance that trust/calm-oriented medical brands should favor restraint over personality/maximalism, while keeping their real medical credibility legible rather than buried under aesthetics.

**Palette:** Cool stone/off-white canvas (not warm bone/cream — `design-taste-frontend`'s Premium-Consumer Palette Ban flags warm-bone-plus-gold as the single most common AI-tell for wellness/premium-consumer briefs; adjusted after that skill was invoked mid-brainstorm). Deep charcoal-navy for primary text. Warm gray for secondary text. One structural accent: a muted sage/stone tone (also a literal nod to "coastal"), used for hairlines, tags, and small structural details only. A muted antique gold appears as a single signature accent — the hero's primary CTA only — never as a repeated system color. No terracotta, no blue gradient banners, no bright teal fills.

**Typography:** Lora (serif, headlines) — selected via `ui-ux-pro-max`'s design-system generator, tagged for "calm, wellness, health, natural" moods, independently converging on the same instinct as the approved direction. Paired with a clean humanist sans for body (not Inter/Roboto/Arial). Italic used only for genuine emphasis within the same font family, never a permanent subtitle style (this is what reads as templated on the current site). Serif use here is justified per `design-taste-frontend`'s serif-discipline rule: this is a genuinely editorial/authoritative brand voice for a premium medical practice, articulated deliberately, not a default "creative brief = serif" reach.

**Iconography:** Phosphor icons, single family, monochrome, used sparingly — not one colored icon-in-a-circle per card repeated across every section.

**Motion:** One signature moment (hero video settling into the press logo wall on scroll). Quiet, consistent scroll-fade reveals elsewhere (opacity + ~12px translate, ~600ms). Hover states are barely-there (color shift or hairline underline, never scale-bounce or shadow pop). Every animation must be traceable to a one-sentence reason (hierarchy, storytelling, feedback, or state transition) — no decoration for its own sake. All motion respects `prefers-reduced-motion`.

## 5. Homepage structure

Eight sections, applying `design-taste-frontend`'s anti-repetition rules directly against the current site's card-soup problem. At most one eyebrow used across the whole page (current site uses five).

1. **Hero** — drone video, headline (≤2 lines), one line of subtext, one primary CTA ("Schedule Consultation," carrying the gold accent), phone number as a quiet secondary text link. No eyebrow/location badge (location folds into headline/subtext copy instead), no ticker, no floating phone bubble, no scroll cue.
2. **Press logo wall** — directly under the hero (not inside it), real press logos (GQ, Marie Claire, Good Housekeeping, Yahoo Health, etc.), quiet, no header copy needed.
3. **Philosophy** — one headline, one short paragraph. Replaces the current two-paragraph dense block.
4. **Services** — condensed bento layout with real photography in 2-3 cells (not 4 identical white text-only cards), linking to the full Services page.
5. **Curated credibility** — the two strongest features (GQ, Marie Claire) presented large/editorial, plus the real stat strip (3B+ impressions, 11+ press features, 7 podcasts, 117M+ monthly readers), linking to the full As Seen In page.
6. **Testimonials** — 2-3 real quotes trimmed to ≤3 lines each, a different layout family than Services (not another card grid).
7. **Signature therapy highlight** — EBOO and BEMER folded into one considered section instead of two bolted-on colored banners, staying within the locked palette (no blue gradient).
8. **Final CTA + footer** — one restated booking CTA, both locations, contact info, secondary nav links.

## 6. Hero (detail)

Full-bleed drone video of Newport Beach, client-provided footage. Sourced/shot at 4K for crop/reframe/stabilization headroom, but delivered as a compressed web-optimized file (H.264 + WebM fallback, 1080p or 1440p, ~15-20s loop, target 10-15MB) with a poster-frame still so the hero paints instantly before video loads — hero load time is the first impression, and an unoptimized file actively works against the halo effect this whole redesign is built around. Mobile gets a shorter/lighter clip or the poster frame rather than fighting for bandwidth.

Subtle dark gradient across the bottom third only, for text/CTA legibility, keeping the footage itself the focal point.

Text stack (max 4 elements per `design-taste-frontend`'s Hero Stack Discipline): headline (≤2 lines), subtext (≤20 words), one primary CTA + phone as secondary text link. No eyebrow, no trust micro-strip, no scroll cue in the hero itself.

Nav: single line, transparent/glass over video, ~72px tall. Services, About, Contact, plus the CTA — secondary items (Memberships, Shop, Conditions Treated) move to the footer rather than crowding an 8-item bar.

## 7. Subpages (detail)

**Services / Treatments:** short philosophy restatement, then treatments organized into 2-3 real clusters (e.g. Hormone & Metabolic, IV & Regenerative, Gut & Immune) each with real photography — not one flat list of 6 identical cards. Booking CTA repeated at the bottom.

**Contact / Book:** two location cards (Newport Beach, Rancho Cucamonga) with address, hours, phone, simple map graphic. Booking is the primary path; a contact form is secondary, built with labels above inputs and visible validation states (no placeholder-as-label).

**As Seen In:** the real stat strip gets its own clean presentation. The two flagship features (GQ, Marie Claire) keep the large editorial treatment. Remaining placements group into Magazines and Podcasts clusters instead of one repetitive 12-card wall.

## 8. Primary conversion goal

Online booking is the primary CTA everywhere it appears; the phone number is present but visually secondary — consistent labeling throughout (no "Schedule Online" / "Schedule Consultation" / "Book Now" variation creating duplicate CTA intent).

## 9. Stack

Next.js (App Router, Server Components by default). Tailwind v4 built on the approved design tokens. Lora + humanist sans self-hosted via `next/font` (never a Google Fonts `<link>` in production). Phosphor icons, single family, no hand-rolled SVGs.

Motion (`motion/react`) for lightweight in-view reveals and hover states, isolated in client components. GSAP + ScrollTrigger reserved for the one signature hero-to-logo-wall scroll moment, isolated in its own client leaf (GSAP and Motion never share a component tree, per `design-taste-frontend`). `next/image` for the video poster frame and service photography, targeting real Core Web Vitals since LCP directly affects the SEO this whole multi-page decision depends on. Contact page's form uses accessible, ownable primitives (shadcn/ui form components) since this needs to hold up as maintained production code.

This is a deliberate departure from the `demo-site` skill's usual vanilla HTML/CSS/JS default (used for Ironvein, Lumen, Meridian) — those were one-off pitch pieces; this is meant to ship as the real site, which makes Next.js's shared components, image/font optimization, and SEO tooling worth the added build complexity.

`demo-site`'s process discipline still applies regardless of stack: hero built and verified first, screenshot evidence via preview tools before anything is reported done, `prefers-reduced-motion` respected everywhere.

## 10. Open items for later (not blocking this spec)

- Actual hero drone footage file (client-provided, pending)
- Final copy pass (headline, subtext, testimonial trims to ≤3 lines, philosophy paragraph)
- Booking system integration detail (embed vs. link to existing scheduler)
- Real photography for Services page clusters and homepage bento cells
- Deployment target (Vercel vs. client's existing host)
