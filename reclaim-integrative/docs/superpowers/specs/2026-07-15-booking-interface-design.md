# Reclaim Integrative — In-Site Booking Interface (Demo) — Design Spec

**Date:** 2026-07-15
**Status:** Approved by Adam. Build target: demo quality that is shippable-after-approval.
**Context:** The client currently uses OptiMantra. Its hosted scheduler opens in a new tab, looks clunky, and discards the service the visitor already picked. This spec replaces that experience with a fully custom, in-site booking flow in the Reclaim design system. **No real integration in this phase** — availability and confirmation are simulated. The flow is designed so the final step can later hand off to (a) an embedded, pre-populated OptiMantra scheduler or (b) an API-first scheduler, without redesign.

---

## 1. Non-negotiable project rules (from the vault's AI Cross-Tool Rules)

1. Work ONLY in `/Users/adamlahham/Developer/reclaim-integrative-homepage/reclaim-integrative` (git worktree, branch `reclaim-integrative-homepage`). Never touch `/Users/adamlahham/Desktop/IVY AI/reclaim-integrative` (stale, iCloud-broken).
2. `npm run test` must pass before starting AND before finishing. `npm run lint` must exit 0. `npm run build` must succeed.
3. Every new component/page gets a colocated Vitest + React Testing Library test (`foo.tsx` + `foo.test.tsx`), same style as existing tests in `src/components/home/`.
4. Never delete/skip/loosen an existing test.
5. **Gold accent appears in exactly one place on the entire site: the homepage Hero CTA.** All booking-flow buttons use the existing `Button` `primary`, `inverse`, or `text` variants.
6. Booking CTA label is consistent site-wide. Check `SiteNav`'s current label and match it exactly everywhere (do not introduce new variants like "Book Now").
7. At most one "eyebrow" label exists across the whole site (the homepage already has it). **Zero new eyebrows in the booking flow.**
8. Zero em-dashes in visible copy. Use periods, commas, or hyphens.
9. Fonts: Lora (headlines) + Work Sans (body) only. Icons: Phosphor only (`@phosphor-icons/react`, use `/dist/ssr` path in Server Components).
10. Palette locked: cool stone canvas, charcoal-navy ink, muted sage accent. No terracotta, no blue gradients, no teal. Check WCAG AA (4.5:1) on any new text/background pairing.
11. Motion: `motion/react` for reveals/transitions, quiet (opacity + ~12px translate, ~300-600ms). GSAP is reserved for the homepage hero only — do not use GSAP here. Respect `prefers-reduced-motion`.
12. Commit granularly with clear messages as you complete each phase.

---

## 2. What to build

A multi-step booking flow at **`/book`** (dedicated route, not a modal), plus wiring so every booking CTA on the site enters it.

### Flow (service-first)

```
Step 1  Service    — category cards, then service list within category
Step 2  Location   — filtered to locations that offer the chosen service
Step 3  Add-ons    — ONLY for IV Therapy services that have suggested add-ons; otherwise skipped
Step 4  Date & time — simulated availability calendar
Step 5  Your details — name, email, phone, new/returning patient, optional note
Step 6  Review & confirm → confirmation screen
```

- A **persistent booking summary** shows the running selection and total price: sticky sidebar on desktop, collapsible bar on mobile.
- A **step indicator** shows progress. Steps are navigable backwards; changing service resets downstream steps (location kept if still valid).
- Steps animate between each other with a quiet Motion crossfade/slide.
- State lives in a client-side context or reducer. URL supports deep links (below) but does not need to encode every step.

### Deep links / entry points

- `/book` → Step 1 welcome.
- `/book?service=<service-slug>` → service pre-selected, opens on Step 2 (location).
- `/book?category=<category-slug>` → category pre-selected, opens on Step 1's service list.
- Invalid slugs fall back gracefully to Step 1 (no crash, no error screen).

Wire these existing CTAs to `/book` (they are currently inert or placeholder links — find all of them, including: SiteNav CTA, homepage Hero CTA, mobile sticky CTA, final CTA band, therapy highlight section, contact page, memberships page, FAQ page CTAs if any):
- Generic booking CTAs → `/book`.
- The **Services page** (`/services`): every service card becomes clickable → `/book?service=…` or `/book?category=…` per the mapping in §5.
- Contact page: booking becomes the primary path (link to `/book`), form stays secondary.

### Confirmation (demo behavior)

- Review screen shows service, location, add-ons, date/time, total, patient details.
- Confirm button produces an elegant confirmation screen (Phosphor check icon, appointment summary, "what happens next" copy: intake forms by email, arrive 10 minutes early, cancellation policy line).
- Include one small, tasteful, dismissible notice on the confirmation screen only: "Demo preview. No appointment has been created." (so the client never mistakes it for live). Do not brand the rest of the flow as a demo.
- No network calls. No data persisted.

### Simulated availability rules

- Generate slots deterministically (seed from the date string, not `Math.random()` at render) to avoid hydration mismatches.
- Hours: Mon-Fri 9:00-17:00, Sat 9:00-13:00, closed Sunday. Slot interval = service duration, minimum 30 min granularity for 15-min services.
- Show next 14 days; disable past days and today's past times; make roughly 60-75% of slots available so days look realistically busy.
- Timezone: display as Pacific, no timezone math needed (static demo).

---

## 3. Data model

Create `src/data/booking.ts` (typed, exported constants + helper functions). Types roughly:

```ts
type LocationId = "newport-beach" | "rancho-cucamonga";
interface Location { id: LocationId; name: string; address: string; phone?: string }
interface AddOn { id: string; name: string; price: number; description?: string }
interface BookingService {
  slug: string;
  name: string;
  category: CategoryId;
  durationMin: number;
  price: number | null;          // null = program/membership pricing, render "Membership pricing" not "$0"
  priceNote?: string;            // e.g. Vitamin C tiers
  kind: "Lab" | "Office Visit" | "Procedure" | "Other";
  description?: string;
  locations: LocationId[];
  addOnIds?: string[];           // suggested add-ons (IV services)
  variants?: { label: string; price: number }[]; // Vitamin C dosage tiers
}
```

Helpers: `getServiceBySlug`, `getServicesByCategory(category, location?)`, `getLocationsForService(slug)`, `getAddOnsForService(slug)`.

Include a data-integrity test (`booking.test.ts`): every `addOnId` resolves, every service has ≥1 location, slugs unique, categories valid, EBOO is Newport-only, Mega B / B12 / Taurine / Fat Burner w/ B12 are Rancho-only, prices match this spec.

### Locations

- **Newport Beach** — 1100 Quail Street, Suite 117, Newport Beach, CA
- **Rancho Cucamonga** — 10470 Foothill Boulevard, Suite 220, Rancho Cucamonga, CA

### Categories

| id | name | locations |
|---|---|---|
| `blood-draw` | Blood Draw | both |
| `consultations` | Consultations | both |
| `im-shots` | Vitamin Injections (IM Shots) | both |
| `iv-therapy` | IV Therapy | both |
| `eboo` | EBOO Therapy | Newport Beach only |

### Blood Draw (both locations)

| service | duration | price | kind |
|---|---|---|---|
| Blood Draw (typically fasting unless otherwise noted) | 30 | $40 | Lab |

### Consultations

| service | duration | price | locations | description (condense, fix typos, no em-dashes) |
|---|---|---|---|---|
| Follow Up (Virtual), Lab Review | 45 | $175 | both | First follow-up: check in on treatment recommendations, review lab results in depth, refine the plan. |
| Dr. Colon Initial Consultation (Virtual) | 60 | $400 | both | Detailed health history: goals, medical and family history, current symptoms, medications and supplements, diet and lifestyle. Diagnostic testing may be recommended (out of pocket, HSA/FSA accepted). |
| New Patient Visit (Virtual) | 60 | $350 | **Rancho Cucamonga only** | |
| Follow Up (In Office), 30 Minutes | 30 | $150 | both | |
| Follow Up (In Person), Lab Review | 45 | $175 | both | |
| Follow Up (Virtual), 30 Minutes | 30 | $150 | both | |
| Dr. Colon Initial Consultation (In Office) | 60 | $400 | both | |

### IM Shots

| service | duration | price | locations | description |
|---|---|---|---|---|
| B12 Vitamin Shot | 15 | $25 | **RC only** | Improve energy, immune support, mental clarity. |
| Mega B Vitamin Shot | 15 | $35 | **RC only** | Combination of B12 and B Complex to support energy levels. |
| Fat Burner Vitamin Shot | 15 | $30 | both | Increase natural energy levels, target belly fat, improve liver health and function. |
| Fat Burner with B12 Vitamin Shot | 15 | $40 | **RC only** | |
| Taurine Vitamin Shot | 15 | $20 | **RC only** | Improve energy, mental clarity, heart health and athletic performance. |
| TRT Injection | 15 | membership pricing (`price: null`) | both | |
| Semaglutide | 15 | membership pricing (`price: null`) | both | kind: Other |

### EBOO (Newport Beach only)

| service | duration | price |
|---|---|---|
| EBOO | 120 | $1,200 |

### IV Therapy (identical menu at both locations)

| service | duration | price | add-ons (ids) |
|---|---|---|---|
| IV Myers Cocktail | 60 | $160 | glut-push, iv-glut-2g, iv-glut-1g, iv-hangover-addon, iv-methylene-blue, iv-nad-250-addon, iv-nad-750-addon, iv-nutrition-addon, iv-plaquex-addon |
| IV Hangover | 60 | $175 | b12-addon, glut-push, iv-glut-1g, taurine-addon |
| Glutathione Push | 15 | $50 | iv-hangover-addon, iv-iron-addon, iv-myers-addon |
| IV Immune Support (*requires G6PD enzyme marker blood draw*) | 60 | $220 | glut-push |
| IV Vitamin C | 60 | $180 base, variants: 25g $180 / 40g $210 / 50g $240 / 60g $265 / 75g $295 (*requires G6PD enzyme marker*) | — |
| IV Iron (*requires documentation of low iron*) | 60 | $300 | glut-push, iv-myers-addon |
| IV Glutathione, 1 Gram | 30 | $120 | b12-addon, iv-migraine-addon, iv-myers-addon |
| IV Glutathione, 2 Grams | 30 | $160 | iv-hangover-addon, iv-methylene-blue, iv-myers-addon, iv-nad-250-addon, iv-nad-750-addon, iv-nutrition-addon, iv-plaquex-addon |
| IV Mitochondria | 60 | $160 | — |
| IV Nutrition | 60 | $150 | — |
| IV Migraine and Headache | 60 | $180 | — |
| IV NAD 250mg | 60 | $300 | — |
| IV Plaquex | 60 | $220 | — |
| IV NAD 750mg | 120 | $900 | — |
| IV Men's Health | 60 | $180 | — |

### Add-on catalog

| id | name | price |
|---|---|---|
| glut-push | Glutathione Push | $50 |
| iv-glut-1g | IV Glutathione, 1 Gram | $120 |
| iv-glut-2g | IV Glutathione, 2 Grams | $160 |
| iv-hangover-addon | IV Hangover | $175 |
| iv-methylene-blue | IV Methylene Blue | $200 |
| iv-nad-250-addon | IV NAD 250mg | $300 |
| iv-nad-750-addon | IV NAD 750mg | $900 |
| iv-nutrition-addon | IV Nutrition | $150 |
| iv-plaquex-addon | IV Plaquex | $220 |
| iv-myers-addon | IV Myers Cocktail | $160 |
| iv-iron-addon | IV Iron | $300 |
| iv-migraine-addon | IV Migraine and Headache | $180 |
| b12-addon | B12 Vitamin Shot | $25 |
| taurine-addon | Taurine Vitamin Shot | $20 |

Use short descriptions from §2 catalogs where available (Glutathione: "master antioxidant, supports detox, immunity, recovery"; keep them one line).

---

## 4. UI / design direction

Coastal Clinical Minimalism, same system as the rest of the site. This flow should feel like a calm medical concierge, not an e-commerce checkout.

- **Layout:** centered content column (~720px) + summary sidebar (~320px) on desktop. Generous whitespace. Section headings in Lora.
- **Category cards (Step 1):** large tappable cards with one Phosphor icon each (e.g. `Drop` for IV, `Syringe` for IM shots, `TestTube`/`Flask` for blood draw, `ChatCircleText` for consultations, `Heartbeat` for EBOO), name, one-line description, service count. Sage hairline borders, hover lift consistent with existing service cards.
- **Service rows:** name, duration + kind as quiet metadata, price right-aligned, expandable description if present. Selected state uses a sage border/ink treatment, not gold.
- **Location step:** two location cards with address and a small static map placeholder or Phosphor `MapPin`; unavailable location is not shown (do not show disabled dead ends). If only one location offers the service, show it as pre-selected with copy like "Available at our Newport Beach clinic."
- **Add-ons:** checkbox cards with price deltas, running total updates in the summary.
- **Calendar:** 14-day horizontal date strip + time-slot grid. Selected slot in charcoal ink. Disabled slots faint.
- **Form:** labels above inputs, visible validation states, real `type=tel`/`email` inputs. Required: name, email, phone. Radio: new vs. returning patient.
- **Notes for special requirements:** services with asterisked requirements (G6PD, iron documentation) show a quiet informational line with Phosphor `Info` icon on the service and review screens.
- **Price display:** `null` price renders "Membership pricing" (never "$0.00"). Vitamin C renders a dosage select on the service step.
- Mobile: single column, summary collapses to a sticky bottom bar showing service + total with an expand toggle. Test at 375px width.
- Accessibility: full keyboard navigation, focus states, `aria-current` on the step indicator, labelled controls, contrast-checked.

---

## 5. Services page → booking mapping

The marketing Services page lists 15 offerings. Map each card's click to a deep link:

| Services page card | Deep link |
|---|---|
| New Patient Consultation | `/book?category=consultations` |
| Hormone Therapy | `/book?category=consultations` |
| TRT Treatment | `/book?service=trt-injection` |
| IV Therapy | `/book?category=iv-therapy` |
| Peptide Therapy | `/book?category=consultations` |
| B12 Injections | `/book?service=b12-vitamin-shot` |
| Mega B Injections | `/book?service=mega-b-vitamin-shot` |
| Fat Burner Injections | `/book?service=fat-burner-vitamin-shot` |
| NAD+ Injections | `/book?service=iv-nad-250` |
| Glutathione Injections | `/book?service=glutathione-push` |
| Alpha Lipoic Acid IV | `/book?category=iv-therapy` |
| Alpha Lipoic Acid Injection | `/book?category=im-shots` |
| Weight Management | `/book?service=semaglutide` |
| EBOO Therapy | `/book?service=eboo` |
| Comprehensive Labs | `/book?service=blood-draw` |

(Adjust slugs to whatever you name them; keep them kebab-case and stable. If the current Services page has fewer/different cards than these 15, update the page so all 15 are present, reusing the existing card grid design.)

Note: services with no direct bookable OptiMantra item (Hormone/Peptide/ALA) intentionally route to the nearest sensible category. Do not invent bookable services that are not in §3.

---

## 6. Verification (required before done)

1. Full test suite passes (existing 39+ plus all new tests). `npm run lint` exits 0. `npm run build` succeeds.
2. Browser verification with the dev server: walk the ENTIRE flow at desktop and 375px mobile widths, including: generic entry, `?service=eboo` (single-location auto-select), `?service=b12-vitamin-shot` (RC-only), an IV service with add-ons and the Vitamin C dosage variant, back-navigation, invalid `?service=nonsense` fallback. Take screenshots as proof at key steps.
3. Check the browser console is clean (no hydration warnings — the availability generator is the likely culprit if any appear).
4. Confirm no gold anywhere in the new flow, no em-dashes in copy, CTA labels consistent.
5. Commit all work in logical commits on `reclaim-integrative-homepage`.

## 7. Documentation updates (required, end of session)

Update the Obsidian vault at `/Users/adamlahham/Downloads/Obsidian/Notebook/Reclaim Integrative Client/`:
- `Overview.md` "Quick status": add booking-flow line items.
- `Build Progress & Plan.md`: add a "Session Update: Booking Interface" section documenting what was built and any real bugs/gotchas hit, matching the existing level of detail.
- If you make a real judgment call not covered by this spec, write it down there.
