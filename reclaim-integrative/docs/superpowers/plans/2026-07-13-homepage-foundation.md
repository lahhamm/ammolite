# Reclaim Integrative — Foundation & Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js foundation (design tokens, shared nav/footer, primitives) and build the full 8-section homepage from `docs/superpowers/specs/2026-07-13-reclaim-integrative-redesign-design.md`, verified against the spec's anti-pattern rules with both automated tests and browser preview.

**Architecture:** Next.js App Router project with Server Components by default; each homepage section is its own component under `src/components/home/`, composed into `src/app/page.tsx`. Motion-bearing components (`Hero`, scroll-reveal wrapper) are isolated `'use client'` leaves. Design tokens live as CSS variables in `globals.css`, consumed via Tailwind v4's `@theme` block — no separate `tailwind.config.js` token duplication.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind v4, `next/font` (Lora + Work Sans), `@phosphor-icons/react`, `motion` (motion/react), GSAP + ScrollTrigger (isolated), Vitest + React Testing Library for component-level assertions.

## Global Constraints

- Palette: cool stone/off-white canvas, charcoal-navy primary text, warm-gray secondary text, one sage/stone structural accent, gold used ONLY as the hero CTA's signature accent — never repeated as a system color. No terracotta, no blue gradients, no bright teal.
- Typography: Lora (serif, headlines/italic-emphasis only) + Work Sans (body). No Inter/Roboto/Arial. No Fraunces/Instrument Serif.
- Icons: Phosphor only, single stroke weight, no hand-rolled SVGs.
- Motion: every animation must be traceable to one sentence of purpose. All motion wrapped for `prefers-reduced-motion`. GSAP and Motion never share a component tree.
- Hero Stack Discipline: max 4 text elements (headline, subtext, primary CTA, secondary text link). No eyebrow, no scroll cue, no trust micro-strip inside the hero.
- No Duplicate CTA Intent: exactly one label for the booking action ("Schedule Consultation") used everywhere it appears on the page.
- Eyebrow Restraint: at most 1 eyebrow-style label across the entire 8-section homepage.
- Quotes ≤3 lines of body text, real attribution (name + city, no em-dash).
- Zero em-dashes anywhere in visible copy. Use periods, commas, or hyphens.
- `next/image` for all photography; no `<img>` tags for local/optimizable assets.

---

## Scope Check

This plan covers **Foundation + Homepage only** (Task 1-17). The spec also calls for Services/Treatments, Contact/Book, and As Seen In subpages — those depend on the Nav, Footer, design tokens, and `Button`/`ScrollReveal` primitives built here, but are otherwise independent page builds. Rather than cram four page builds into one plan, this plan delivers a fully working, deployable homepage on its own; the three subpages get their own follow-up plan once this one is reviewed. This matches the spec's own phased framing (Section 3: "four templates," Section 9: hero-first build order) and keeps each plan's deliverable independently testable.

Real assets (drone footage, service photography) are pending from the client (spec Section 10). Tasks below use a placeholder poster image (Picsum seeded URL) and clearly-labeled TODO asset slots so the page is fully functional and honest about what's a placeholder versus real content — never a fake/hand-rolled substitute.

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: `reclaim-integrative/` (entire project via `create-next-app`)
- Create: `reclaim-integrative/vitest.config.ts`
- Create: `reclaim-integrative/vitest.setup.ts`
- Modify: `reclaim-integrative/package.json` (add test script + deps)

**Interfaces:**
- Produces: a runnable Next.js app at `reclaim-integrative/` with `npm run dev`, `npm run test`, `npm run build` all working.

- [ ] **Step 1: Scaffold with create-next-app**

Run from `/Users/adamlahham/Desktop/IVY AI`:

```bash
npx create-next-app@latest reclaim-integrative --typescript --tailwind --app --eslint --src-dir --import-alias "@/*" --no-turbopack
cd reclaim-integrative
```

Expected: a working Next.js + Tailwind v4 app (Tailwind v4 is the `create-next-app` default as of this writing — confirm `src/app/globals.css` contains `@import "tailwindcss";` at the top; if it instead scaffolds v3 with a `tailwind.config.ts`, run `npm install tailwindcss@latest @tailwindcss/postcss@latest` and replace the config per Tailwind v4's CSS-first migration before continuing).

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install motion gsap @phosphor-icons/react
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 4: Configure Vitest**

Create `reclaim-integrative/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `reclaim-integrative/vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Add test script to package.json**

In `reclaim-integrative/package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 6: Verify the scaffold runs**

Run: `npm run build`
Expected: build succeeds with the default Next.js starter page.

- [ ] **Step 7: Commit**

```bash
git add reclaim-integrative/
git commit -m "chore: scaffold Next.js app with Tailwind v4 and Vitest"
```

---

## Task 2: Design tokens and global styles

**Files:**
- Modify: `reclaim-integrative/src/app/globals.css`

**Interfaces:**
- Produces: CSS variables `--color-canvas`, `--color-ink`, `--color-muted`, `--color-accent-sage`, `--color-accent-gold`, `--color-border`, and Tailwind utilities `bg-canvas`, `text-ink`, `text-muted`, `border-border`, `text-accent-sage`, `bg-accent-gold`, `text-accent-gold` for later tasks to consume.

- [ ] **Step 1: Replace globals.css with the token system**

Replace the full contents of `reclaim-integrative/src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-canvas: #f4f5f3;
  --color-ink: #1b2228;
  --color-muted: #5b6570;
  --color-accent-sage: #5f7566;
  --color-accent-gold: #a8823e;
  --color-border: #dde1de;

  --font-serif: var(--font-lora), serif;
  --font-sans: var(--font-work-sans), sans-serif;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  background-color: var(--color-canvas);
  color: var(--color-ink);
}
```

- [ ] **Step 2: Verify Tailwind picks up the tokens**

Run: `npm run dev` and visit `http://localhost:3000`.
Expected: page background is the cool stone tone (`#f4f5f3`), not pure white. (Server runs in background; check via `curl -s http://localhost:3000 | grep -o 'f4f5f3'` returning a match, or inspect visually.)

- [ ] **Step 3: Commit**

```bash
git add reclaim-integrative/src/app/globals.css
git commit -m "feat: add design token system (palette, fonts, reduced-motion)"
```

---

## Task 3: Fonts via next/font

**Files:**
- Modify: `reclaim-integrative/src/app/layout.tsx`

**Interfaces:**
- Produces: CSS variables `--font-lora` and `--font-work-sans` applied to `<html>`, consumed by Task 2's `--font-serif`/`--font-sans` tokens.

- [ ] **Step 1: Wire up next/font/google in layout.tsx**

Replace the font-related portion of `reclaim-integrative/src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Lora, Work_Sans } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reclaim Integrative Medicine | Naturopathic Doctor Newport Beach",
  description:
    "Personalized naturopathic and integrative medicine in Newport Beach and Rancho Cucamonga. Hormone optimization, IV therapy, and root-cause care.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lora.variable} ${workSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify fonts load**

Run: `npm run dev`, load the homepage, inspect a `<body>` element's computed `font-family` in devtools.
Expected: resolves to the Work Sans font stack, not a system default.

- [ ] **Step 3: Commit**

```bash
git add reclaim-integrative/src/app/layout.tsx
git commit -m "feat: wire up Lora and Work Sans via next/font"
```

---

## Task 4: Button primitive (single CTA style, gold reserved for hero)

**Files:**
- Create: `reclaim-integrative/src/components/ui/button.tsx`
- Test: `reclaim-integrative/src/components/ui/button.test.tsx`

**Interfaces:**
- Produces: `<Button variant="primary" | "gold" | "text">` — `primary` is charcoal-navy (used on every CTA except the hero), `gold` is reserved for the hero CTA only, `text` is the quiet secondary link style (phone number).
- Consumes: nothing.

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/ui/button.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders primary variant with charcoal background token", () => {
    render(<Button variant="primary">Schedule Consultation</Button>);
    const button = screen.getByRole("button", { name: "Schedule Consultation" });
    expect(button.className).toContain("bg-ink");
  });

  it("renders gold variant only when explicitly requested", () => {
    render(<Button variant="gold">Schedule Consultation</Button>);
    const button = screen.getByRole("button", { name: "Schedule Consultation" });
    expect(button.className).toContain("bg-accent-gold");
  });

  it("renders text variant as a plain link-style control with no background fill", () => {
    render(<Button variant="text">(949) 423-3522</Button>);
    const button = screen.getByRole("button", { name: "(949) 423-3522" });
    expect(button.className).not.toContain("bg-");
  });

  it("renders inverse variant for CTAs on dark backgrounds without reusing gold", () => {
    render(<Button variant="inverse">Schedule Consultation</Button>);
    const button = screen.getByRole("button", { name: "Schedule Consultation" });
    expect(button.className).toContain("border-canvas");
    expect(button.className).not.toContain("bg-accent-gold");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './button'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/ui/button.tsx`:

```typescript
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "gold" | "inverse" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-ink/85",
  gold: "bg-accent-gold text-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-accent-gold/85",
  inverse:
    "bg-transparent text-canvas border border-canvas px-6 py-3 rounded-sm transition-colors duration-200 hover:bg-canvas/10",
  text: "text-ink underline-offset-4 hover:underline transition-colors duration-200",
};

export function Button({ variant, children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`${VARIANT_CLASSES[variant]} ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/ui/button.tsx reclaim-integrative/src/components/ui/button.test.tsx
git commit -m "feat: add Button primitive with primary/gold/inverse/text variants"
```

---

## Task 5: ScrollReveal wrapper (Motion, in-view fades)

**Files:**
- Create: `reclaim-integrative/src/components/ui/scroll-reveal.tsx`
- Test: `reclaim-integrative/src/components/ui/scroll-reveal.test.tsx`

**Interfaces:**
- Produces: `<ScrollReveal>{children}</ScrollReveal>` — wraps a section, fades/translates it in once on scroll, respects reduced motion.
- Consumes: `motion/react`.

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/ui/scroll-reveal.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollReveal } from "./scroll-reveal";

describe("ScrollReveal", () => {
  it("renders its children", () => {
    render(
      <ScrollReveal>
        <p>Section content</p>
      </ScrollReveal>
    );
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './scroll-reveal'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/ui/scroll-reveal.tsx`:

```typescript
"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function ScrollReveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/ui/scroll-reveal.tsx reclaim-integrative/src/components/ui/scroll-reveal.test.tsx
git commit -m "feat: add ScrollReveal motion wrapper with reduced-motion support"
```

---

## Task 6: Site navigation

**Files:**
- Create: `reclaim-integrative/src/components/layout/site-nav.tsx`
- Test: `reclaim-integrative/src/components/layout/site-nav.test.tsx`

**Interfaces:**
- Produces: `<SiteNav />` — single-line nav, Services/About/Contact + one CTA, transparent-over-hero variant via `transparent` prop.
- Consumes: `Button` from Task 4.

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/layout/site-nav.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteNav } from "./site-nav";

describe("SiteNav", () => {
  it("renders exactly three primary nav links plus one CTA", () => {
    render(<SiteNav />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.textContent)).toEqual(["Services", "About", "Contact"]);
  });

  it("renders exactly one CTA with the canonical booking label", () => {
    render(<SiteNav />);
    const ctas = screen.getAllByRole("button", { name: "Schedule Consultation" });
    expect(ctas).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './site-nav'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/layout/site-nav.tsx`:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteNav({ transparent = false }: { transparent?: boolean }) {
  return (
    <header
      className={`w-full h-[72px] flex items-center justify-between px-6 md:px-10 ${
        transparent ? "absolute top-0 left-0 z-10 bg-transparent" : "bg-canvas border-b border-border"
      }`}
    >
      <Link href="/" className="font-serif text-xl text-ink">
        Reclaim
      </Link>
      <nav className="hidden md:flex items-center gap-8 font-sans text-sm text-ink">
        <Link href="/services">Services</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <Button variant="primary" className="text-sm">
        Schedule Consultation
      </Button>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/layout/site-nav.tsx reclaim-integrative/src/components/layout/site-nav.test.tsx
git commit -m "feat: add SiteNav with single-line layout and one CTA"
```

---

## Task 7: Site footer

**Files:**
- Create: `reclaim-integrative/src/components/layout/site-footer.tsx`
- Test: `reclaim-integrative/src/components/layout/site-footer.test.tsx`

**Interfaces:**
- Produces: `<SiteFooter />` — both locations, secondary nav links (Memberships, Shop, Conditions Treated, What to Expect), contact info.
- Consumes: nothing.

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/layout/site-footer.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders both clinic locations", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/Newport Beach, CA 92660/)).toBeInTheDocument();
    expect(screen.getByText(/Rancho Cucamonga, CA 91730/)).toBeInTheDocument();
  });

  it("renders the secondary nav items moved out of the primary nav", () => {
    render(<SiteFooter />);
    ["Memberships", "Shop", "Conditions Treated", "What to Expect"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("labels the phone and email contact rows with accessible icons, not decorative-only", () => {
    render(<SiteFooter />);
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './site-footer'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/layout/site-footer.tsx`:

```typescript
import Link from "next/link";
import { Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

const SECONDARY_LINKS = [
  { label: "Memberships", href: "/memberships" },
  { label: "Shop", href: "/shop" },
  { label: "Conditions Treated", href: "/conditions-treated" },
  { label: "What to Expect", href: "/what-to-expect" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-canvas px-6 md:px-10 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-serif text-lg mb-3">Reclaim Integrative Medicine</p>
          <p className="text-sm text-canvas/70">
            1100 Quail Street, Suite 117
            <br />
            Newport Beach, CA 92660
          </p>
          <p className="text-sm text-canvas/70 mt-3">
            10470 Foothill Blvd Suite 220
            <br />
            Rancho Cucamonga, CA 91730
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {SECONDARY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-canvas/80 hover:text-canvas">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-canvas/70 flex flex-col gap-2">
          <p className="flex items-center gap-2">
            <Phone size={16} weight="regular" aria-label="Phone" />
            (949) 423-3522
          </p>
          <p className="flex items-center gap-2">
            <EnvelopeSimple size={16} weight="regular" aria-label="Email" />
            reception@reclaimintegrative.com
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/layout/site-footer.tsx reclaim-integrative/src/components/layout/site-footer.test.tsx
git commit -m "feat: add SiteFooter with locations and secondary nav"
```

---

## Task 8: Hero section

**Files:**
- Create: `reclaim-integrative/src/components/home/hero.tsx`
- Test: `reclaim-integrative/src/components/home/hero.test.tsx`

**Interfaces:**
- Produces: `<Hero videoSrc?: string, posterSrc: string />`. If `videoSrc` is omitted (real footage not yet delivered), renders the poster image full-bleed instead of a `<video>` tag — never a broken/empty video element.
- Consumes: `Button` (Task 4), `SiteNav` with `transparent` (Task 6).

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/home/hero.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./hero";

describe("Hero", () => {
  it("renders exactly one primary CTA (Hero Stack Discipline)", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    const ctas = screen.getAllByRole("button", { name: "Schedule Consultation" });
    expect(ctas).toHaveLength(1);
  });

  it("renders the phone number as a secondary text link, not a button styled as a floating bubble", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    const phone = screen.getByRole("button", { name: "(949) 423-3522" });
    expect(phone.className).not.toContain("fixed");
  });

  it("falls back to the poster image when no video source is provided yet", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    expect(screen.queryByTestId("hero-video")).not.toBeInTheDocument();
    expect(screen.getByTestId("hero-poster")).toBeInTheDocument();
  });

  it("has no eyebrow element above the headline", () => {
    render(<Hero posterSrc="/images/hero-poster.jpg" />);
    expect(screen.queryByTestId("eyebrow")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './hero'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/home/hero.tsx`:

```typescript
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/layout/site-nav";

interface HeroProps {
  videoSrc?: string;
  posterSrc: string;
}

export function Hero({ videoSrc, posterSrc }: HeroProps) {
  return (
    <section className="relative min-h-[100dvh] flex flex-col">
      <SiteNav transparent />

      <div className="absolute inset-0">
        {videoSrc ? (
          <video
            data-testid="hero-video"
            className="w-full h-full object-cover"
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Image
            data-testid="hero-poster"
            src={posterSrc}
            alt="Aerial view of the Newport Beach coastline"
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent" />
      </div>

      <div className="relative mt-auto px-6 md:px-10 pb-16 md:pb-24 max-w-2xl">
        <h1 className="font-serif text-4xl md:text-6xl leading-tight text-canvas">
          Root-cause care, in Newport Beach.
        </h1>
        <p className="mt-4 text-canvas/90 max-w-md">
          Personalized naturopathic and integrative medicine for hormones, gut
          health, and lasting energy.
        </p>
        <div className="mt-8 flex items-center gap-6">
          <Button variant="gold">Schedule Consultation</Button>
          <Button variant="text" className="text-canvas">
            (949) 423-3522
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS, 4 tests.

- [ ] **Step 5: Add a placeholder poster asset reference**

The poster image at `public/images/hero-poster.jpg` does not exist yet (real footage/photography is pending from the client per spec Section 10). Create `reclaim-integrative/public/images/README.md`:

```markdown
# Pending assets

- `hero-poster.jpg` — placeholder needed until client delivers a still frame from the drone footage. Use a temporary Newport Beach coastline photo (e.g. an Unsplash/Picsum placeholder) so the homepage renders correctly in the meantime; replace before launch.
- `hero-video.mp4` / `hero-video.webm` — client-provided drone footage, compressed to 1080p/1440p, 15-20s loop, target 10-15MB. Not yet delivered.
```

- [ ] **Step 6: Commit**

```bash
git add reclaim-integrative/src/components/home/hero.tsx reclaim-integrative/src/components/home/hero.test.tsx reclaim-integrative/public/images/README.md
git commit -m "feat: add Hero section with video/poster fallback and hero stack discipline"
```

---

## Task 9: Press logo wall

**Files:**
- Create: `reclaim-integrative/src/components/home/press-logo-wall.tsx`
- Test: `reclaim-integrative/src/components/home/press-logo-wall.test.tsx`

**Interfaces:**
- Produces: `<PressLogoWall />` — quiet, no header copy, renders the real press names as text wordmarks (until real SVG logos are supplied) with alt-equivalent accessible labels.
- Consumes: `ScrollReveal` (Task 5).

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/home/press-logo-wall.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PressLogoWall } from "./press-logo-wall";

describe("PressLogoWall", () => {
  it("renders all six press placements with no category label beneath any of them", () => {
    render(<PressLogoWall />);
    ["GQ", "Marie Claire", "Good Housekeeping", "Yahoo! Health", "Food & Wine", "Authority Magazine"].forEach(
      (name) => {
        expect(screen.getByText(name)).toBeInTheDocument();
      }
    );
    expect(screen.queryByText(/monthly readers/i)).not.toBeInTheDocument();
  });

  it("renders no section eyebrow", () => {
    render(<PressLogoWall />);
    expect(screen.queryByTestId("eyebrow")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './press-logo-wall'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/home/press-logo-wall.tsx`:

```typescript
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const PRESS = ["GQ", "Marie Claire", "Good Housekeeping", "Yahoo! Health", "Food & Wine", "Authority Magazine"];

export function PressLogoWall() {
  return (
    <ScrollReveal>
      <section className="py-16 px-6 md:px-10 border-b border-border">
        <ul className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {PRESS.map((name) => (
            <li key={name} className="font-serif text-lg md:text-xl text-muted">
              {name}
            </li>
          ))}
        </ul>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/home/press-logo-wall.tsx reclaim-integrative/src/components/home/press-logo-wall.test.tsx
git commit -m "feat: add press logo wall section directly under hero"
```

Note: swap the plain-text wordmarks for real SVG press logos once Reclaim provides brand assets or usage rights are confirmed for each outlet's logo mark.

---

## Task 10: GSAP signature scroll moment (hero settles into the press wall)

**Files:**
- Create: `reclaim-integrative/src/components/home/hero-scroll-transition.tsx`
- Test: `reclaim-integrative/src/components/home/hero-scroll-transition.test.tsx`

**Interfaces:**
- Produces: `<HeroScrollTransition hero={...} pressLogoWall={...} />` — the one signature GSAP + ScrollTrigger moment called for in spec Section 4/9: as the visitor scrolls past the hero, it scales down and fades slightly while the press logo wall takes over. Isolated `'use client'` leaf using GSAP only (never mixed with Motion in the same component tree, per `design-taste-frontend`).
- Consumes: `gsap`, `gsap/ScrollTrigger` (installed in Task 1).

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/home/hero-scroll-transition.test.tsx`:

```typescript
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroScrollTransition } from "./hero-scroll-transition";

describe("HeroScrollTransition", () => {
  it("renders both the hero and press logo wall children", () => {
    const { getByText } = render(
      <HeroScrollTransition hero={<p>Hero content</p>} pressLogoWall={<p>Press content</p>} />
    );
    expect(getByText("Hero content")).toBeInTheDocument();
    expect(getByText("Press content")).toBeInTheDocument();
  });

  it("unmounts cleanly without throwing (GSAP context cleanup)", () => {
    const { unmount } = render(
      <HeroScrollTransition hero={<p>Hero content</p>} pressLogoWall={<p>Press content</p>} />
    );
    expect(() => unmount()).not.toThrow();
  });
});
```

Note: jsdom has no real layout/scroll engine, so this test can only verify structural rendering and cleanup, not the actual pinned scale/fade behavior. The real scroll-tied motion is verified visually in Task 17, per the "motion claimed = motion shown" principle — don't fake a scroll assertion jsdom can't perform.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './hero-scroll-transition'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/home/hero-scroll-transition.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

interface HeroScrollTransitionProps {
  hero: ReactNode;
  pressLogoWall: ReactNode;
}

export function HeroScrollTransition({ hero, pressLogoWall }: HeroScrollTransitionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !heroRef.current || !wrapRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(heroRef.current, {
        scale: 0.94,
        opacity: 0.6,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef}>
      <div ref={heroRef}>{hero}</div>
      {pressLogoWall}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/home/hero-scroll-transition.tsx reclaim-integrative/src/components/home/hero-scroll-transition.test.tsx
git commit -m "feat: add the one signature GSAP scroll moment, hero settling into press wall"
```

---

## Task 11: Philosophy section

**Files:**
- Create: `reclaim-integrative/src/components/home/philosophy.tsx`
- Test: `reclaim-integrative/src/components/home/philosophy.test.tsx`

**Interfaces:**
- Produces: `<Philosophy />` — one headline, one short paragraph, no split-header layout.
- Consumes: `ScrollReveal` (Task 5).

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/home/philosophy.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Philosophy } from "./philosophy";

describe("Philosophy", () => {
  it("renders exactly one heading and one paragraph, stacked not split", () => {
    render(<Philosophy />);
    const heading = screen.getByRole("heading");
    const paragraph = screen.getByText(/root cause/i);
    expect(heading).toBeInTheDocument();
    expect(paragraph.tagName).toBe("P");
  });

  it("contains no em-dash anywhere in the copy", () => {
    const { container } = render(<Philosophy />);
    expect(container.textContent).not.toMatch(/—|–/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './philosophy'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/home/philosophy.tsx`:

```typescript
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Philosophy() {
  return (
    <ScrollReveal>
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl leading-snug">
            Medicine that looks for the root cause, not just the symptom.
          </h2>
          <p className="mt-6 text-muted leading-relaxed">
            Every new patient gets 60 minutes with a licensed naturopathic
            doctor, comprehensive labs, and a plan built around hormones, gut
            health, thyroid, and long-term energy, coordinated across every
            visit.
          </p>
        </div>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/home/philosophy.tsx reclaim-integrative/src/components/home/philosophy.test.tsx
git commit -m "feat: add Philosophy section, single-message stacked layout"
```

---

## Task 12: Services teaser (bento)

**Files:**
- Create: `reclaim-integrative/src/components/home/services-teaser.tsx`
- Test: `reclaim-integrative/src/components/home/services-teaser.test.tsx`

**Interfaces:**
- Produces: `<ServicesTeaser />` — asymmetric bento grid, at least 2 cells carrying real visual variation (photography placeholder), links to `/services`.
- Consumes: `ScrollReveal` (Task 5), `next/image`.

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/home/services-teaser.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServicesTeaser } from "./services-teaser";

describe("ServicesTeaser", () => {
  it("renders all four service categories", () => {
    render(<ServicesTeaser />);
    ["Hormone Replacement", "IV Therapy", "Peptide Therapy", "Digestive Health"].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("renders at least two images for visual variation across the grid", () => {
    render(<ServicesTeaser />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it("links through to the full Services page exactly once", () => {
    render(<ServicesTeaser />);
    const links = screen.getAllByRole("link", { name: /view all services/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/services");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './services-teaser'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/home/services-teaser.tsx`:

```typescript
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const SERVICES = [
  {
    name: "Hormone Replacement",
    description: "Bioidentical hormones, including Biote pellet therapy.",
    image: "https://picsum.photos/seed/reclaim-hormone/800/1000",
    span: "md:col-span-3 md:row-span-2",
  },
  {
    name: "IV Therapy",
    description: "Customized nutrient infusions.",
    image: "https://picsum.photos/seed/reclaim-iv/800/500",
    span: "md:col-span-3",
  },
  {
    name: "Peptide Therapy",
    description: "Targeted regenerative protocols.",
    image: null,
    span: "md:col-span-2",
  },
  {
    name: "Digestive Health",
    description: "Gut healing and nutrition counseling.",
    image: null,
    span: "md:col-span-1",
  },
];

export function ServicesTeaser() {
  return (
    <ScrollReveal>
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl mb-10 text-center">Care built around you</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className={`relative rounded-lg overflow-hidden border border-border min-h-[220px] ${service.span}`}
              >
                {service.image && (
                  <Image
                    src={service.image}
                    alt={`${service.name} at Reclaim Integrative Medicine`}
                    fill
                    className="object-cover"
                  />
                )}
                <div
                  className={`relative h-full flex flex-col justify-end p-6 ${
                    service.image ? "bg-gradient-to-t from-ink/80 to-transparent text-canvas" : "bg-canvas text-ink"
                  }`}
                >
                  <h3 className="font-serif text-xl">{service.name}</h3>
                  <p className="text-sm mt-1 opacity-90">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="font-sans text-sm underline underline-offset-4 text-ink">
              View all services
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS, 3 tests.

- [ ] **Step 5: Configure Picsum as an allowed remote image source**

In `reclaim-integrative/next.config.ts`, add:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Commit**

```bash
git add reclaim-integrative/src/components/home/services-teaser.tsx reclaim-integrative/src/components/home/services-teaser.test.tsx reclaim-integrative/next.config.ts
git commit -m "feat: add Services teaser bento grid with placeholder photography"
```

Note: swap `picsum.photos` URLs for real clinic/service photography once delivered, then remove the `remotePatterns` entry.

---

## Task 13: Curated credibility section

**Files:**
- Create: `reclaim-integrative/src/components/home/curated-credibility.tsx`
- Test: `reclaim-integrative/src/components/home/curated-credibility.test.tsx`

**Interfaces:**
- Produces: `<CuratedCredibility />` — GQ + Marie Claire large feature treatment, stat strip, link to `/press`.
- Consumes: `ScrollReveal` (Task 5).

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/home/curated-credibility.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CuratedCredibility } from "./curated-credibility";

describe("CuratedCredibility", () => {
  it("features exactly the two strongest placements, not the full press wall", () => {
    render(<CuratedCredibility />);
    expect(screen.getByText("GQ")).toBeInTheDocument();
    expect(screen.getByText("Marie Claire")).toBeInTheDocument();
    expect(screen.queryByText("Good Housekeeping")).not.toBeInTheDocument();
  });

  it("renders the real stat strip", () => {
    render(<CuratedCredibility />);
    ["3B+", "11+", "7", "117M+"].forEach((stat) => {
      expect(screen.getByText(stat)).toBeInTheDocument();
    });
  });

  it("links to the full As Seen In page exactly once", () => {
    render(<CuratedCredibility />);
    const links = screen.getAllByRole("link", { name: /view all press features/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/press");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './curated-credibility'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/home/curated-credibility.tsx`:

```typescript
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const STATS = [
  { value: "3B+", label: "Media impressions" },
  { value: "11+", label: "Press features" },
  { value: "7", label: "Podcast appearances" },
  { value: "117M+", label: "Monthly readers reached" },
];

export function CuratedCredibility() {
  return (
    <ScrollReveal>
      <section className="py-24 px-6 md:px-10 bg-canvas">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border rounded-lg p-8">
              <p className="font-serif text-sm text-muted mb-2">GQ</p>
              <h3 className="font-serif text-2xl leading-snug">
                Does magnesium spray actually help ease stress and improve sleep?
              </h3>
            </div>
            <div className="border border-border rounded-lg p-8">
              <p className="font-serif text-sm text-muted mb-2">Marie Claire</p>
              <h3 className="font-serif text-2xl leading-snug">
                The surprising benefits of hydrotherapy for circulation and recovery.
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl text-accent-sage">{stat.value}</p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/press" className="font-sans text-sm underline underline-offset-4 text-ink">
              View all press features
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/home/curated-credibility.tsx reclaim-integrative/src/components/home/curated-credibility.test.tsx
git commit -m "feat: add curated credibility section (2 flagship features + stat strip)"
```

---

## Task 14: Testimonials

**Files:**
- Create: `reclaim-integrative/src/components/home/testimonials.tsx`
- Test: `reclaim-integrative/src/components/home/testimonials.test.tsx`

**Interfaces:**
- Produces: `<Testimonials />` — 3 real quotes, each ≤3 lines, horizontal scroll-snap layout (a different layout family than the Services bento, per Section-Layout-Repetition Ban).
- Consumes: `ScrollReveal` (Task 5).

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/home/testimonials.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Testimonials } from "./testimonials";

describe("Testimonials", () => {
  it("renders exactly three testimonials", () => {
    render(<Testimonials />);
    expect(screen.getAllByTestId("testimonial-card")).toHaveLength(3);
  });

  it("keeps every quote to 3 lines or fewer by character budget", () => {
    render(<Testimonials />);
    const quotes = screen.getAllByTestId("testimonial-quote");
    quotes.forEach((quote) => {
      expect(quote.textContent!.length).toBeLessThanOrEqual(180);
    });
  });

  it("attributes each quote with a real name and city, no em-dash", () => {
    render(<Testimonials />);
    const attributions = screen.getAllByTestId("testimonial-attribution");
    attributions.forEach((attribution) => {
      expect(attribution.textContent).toMatch(/,/);
      expect(attribution.textContent).not.toMatch(/—|–/);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './testimonials'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/home/testimonials.tsx`:

```typescript
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const TESTIMONIALS = [
  {
    quote:
      "After years of being told my labs were normal, Dr. Colon found the root cause. Three months in, I felt like a new person.",
    name: "Rachel M.",
    city: "Newport Beach, CA",
  },
  {
    quote:
      "The comprehensive labs were unlike anything my PCP ever ordered. I have my energy back.",
    name: "James T.",
    city: "Irvine, CA",
  },
  {
    quote:
      "I drove from Laguna Beach because a friend raved about the peptide therapy. Worth every mile.",
    name: "Karen S.",
    city: "Laguna Beach, CA",
  },
];

export function Testimonials() {
  return (
    <ScrollReveal>
      <section className="py-24 px-6 md:px-10">
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-10">What patients say</h2>
        <div className="max-w-6xl mx-auto flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              data-testid="testimonial-card"
              className="snap-start shrink-0 w-[320px] border border-border rounded-lg p-6"
            >
              <p data-testid="testimonial-quote" className="font-serif italic leading-snug">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p data-testid="testimonial-attribution" className="text-sm text-muted mt-4">
                {t.name}, {t.city}
              </p>
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/home/testimonials.tsx reclaim-integrative/src/components/home/testimonials.test.tsx
git commit -m "feat: add Testimonials scroll-snap section, distinct layout from Services"
```

---

## Task 15: Signature therapy highlight (EBOO + BEMER combined)

**Files:**
- Create: `reclaim-integrative/src/components/home/therapy-highlight.tsx`
- Test: `reclaim-integrative/src/components/home/therapy-highlight.test.tsx`

**Interfaces:**
- Produces: `<TherapyHighlight />` — one combined section, locked palette (no blue gradient banner).
- Consumes: `ScrollReveal` (Task 5), `Button` (Task 4).

- [ ] **Step 1: Write the failing test**

Create `reclaim-integrative/src/components/home/therapy-highlight.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TherapyHighlight } from "./therapy-highlight";

describe("TherapyHighlight", () => {
  it("renders both EBOO and BEMER as one combined section, not two", () => {
    render(<TherapyHighlight />);
    expect(screen.getByText(/EBOO/)).toBeInTheDocument();
    expect(screen.getByText(/BEMER/)).toBeInTheDocument();
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });

  it("uses the canonical booking CTA label, not a duplicate variant", () => {
    render(<TherapyHighlight />);
    expect(screen.getByRole("button", { name: "Schedule Consultation" })).toBeInTheDocument();
    expect(screen.queryByText(/schedule online/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './therapy-highlight'"

- [ ] **Step 3: Write the implementation**

Create `reclaim-integrative/src/components/home/therapy-highlight.tsx`:

```typescript
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";

export function TherapyHighlight() {
  return (
    <ScrollReveal>
      <section role="region" aria-label="Advanced therapies" className="py-24 px-6 md:px-10 bg-accent-sage/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl">Advanced therapies for lasting recovery</h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            EBOO blood therapy and BEMER PEMF technology work together to
            improve circulation, oxygenation, and cellular recovery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
            <div className="border border-border rounded-lg p-6 bg-canvas">
              <h3 className="font-serif text-xl">EBOO Therapy</h3>
              <p className="text-sm text-muted mt-2">
                Detoxify, oxygenate, and revitalize your blood. Packages starting at $1,170 per session.
              </p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-canvas">
              <h3 className="font-serif text-xl">BEMER PEMF Therapy</h3>
              <p className="text-sm text-muted mt-2">
                Pulsed electromagnetic field technology that stimulates healthy microcirculation.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Button variant="primary">Schedule Consultation</Button>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add reclaim-integrative/src/components/home/therapy-highlight.tsx reclaim-integrative/src/components/home/therapy-highlight.test.tsx
git commit -m "feat: combine EBOO and BEMER into one signature therapy section"
```

---

## Task 16: Final CTA band and homepage assembly

**Files:**
- Create: `reclaim-integrative/src/components/home/final-cta.tsx`
- Test: `reclaim-integrative/src/components/home/final-cta.test.tsx`
- Modify: `reclaim-integrative/src/app/page.tsx`
- Test: `reclaim-integrative/src/app/page.test.tsx`

**Interfaces:**
- Produces: `<FinalCta />` and the assembled `HomePage` composing all 8 sections plus `SiteFooter`.
- Consumes: every component from Tasks 4-15, including `HeroScrollTransition` (Task 10) to wrap `Hero` and `PressLogoWall`.

- [ ] **Step 1: Write the failing test for FinalCta**

Create `reclaim-integrative/src/components/home/final-cta.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinalCta } from "./final-cta";

describe("FinalCta", () => {
  it("uses the canonical booking CTA label", () => {
    render(<FinalCta />);
    expect(screen.getByRole("button", { name: "Schedule Consultation" })).toBeInTheDocument();
  });

  it("does not reuse the gold accent, which is reserved for the hero CTA only", () => {
    render(<FinalCta />);
    const button = screen.getByRole("button", { name: "Schedule Consultation" });
    expect(button.className).not.toContain("bg-accent-gold");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with "Cannot find module './final-cta'"

- [ ] **Step 3: Implement FinalCta**

Create `reclaim-integrative/src/components/home/final-cta.tsx`:

```typescript
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-24 px-6 md:px-10 text-center bg-ink text-canvas">
      <h2 className="font-serif text-3xl md:text-4xl max-w-xl mx-auto">
        Take the first step toward feeling like yourself again.
      </h2>
      <p className="mt-4 text-canvas/80">A complimentary 15-minute consultation starts the process.</p>
      <div className="mt-8">
        <Button variant="inverse">Schedule Consultation</Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify FinalCta passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Write the failing test for the assembled homepage**

Create `reclaim-integrative/src/app/page.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders all 8 sections in order", () => {
    render(<HomePage />);
    expect(screen.getByText(/root-cause care/i)).toBeInTheDocument();
    expect(screen.getByText("GQ")).toBeInTheDocument();
    expect(screen.getByText(/medicine that looks for the root cause/i)).toBeInTheDocument();
    expect(screen.getByText("Care built around you")).toBeInTheDocument();
    expect(screen.getByText(/does magnesium spray/i)).toBeInTheDocument();
    expect(screen.getByText("What patients say")).toBeInTheDocument();
    expect(screen.getByText(/advanced therapies for lasting recovery/i)).toBeInTheDocument();
    expect(screen.getByText(/take the first step/i)).toBeInTheDocument();
  });

  it("uses the canonical booking CTA label everywhere and never a variant (No Duplicate CTA Intent)", () => {
    render(<HomePage />);
    const bookingButtons = screen.getAllByRole("button", { name: "Schedule Consultation" });
    expect(bookingButtons.length).toBeGreaterThan(0);
    expect(screen.queryByText(/book now/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/schedule online/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/let's talk/i)).not.toBeInTheDocument();
  });

  it("uses at most one eyebrow-style label across the whole page (Eyebrow Restraint)", () => {
    render(<HomePage />);
    expect(screen.queryAllByTestId("eyebrow").length).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL (page.tsx still has the default `create-next-app` starter content)

- [ ] **Step 7: Assemble the homepage**

Replace `reclaim-integrative/src/app/page.tsx`:

```typescript
import { Hero } from "@/components/home/hero";
import { PressLogoWall } from "@/components/home/press-logo-wall";
import { HeroScrollTransition } from "@/components/home/hero-scroll-transition";
import { Philosophy } from "@/components/home/philosophy";
import { ServicesTeaser } from "@/components/home/services-teaser";
import { CuratedCredibility } from "@/components/home/curated-credibility";
import { Testimonials } from "@/components/home/testimonials";
import { TherapyHighlight } from "@/components/home/therapy-highlight";
import { FinalCta } from "@/components/home/final-cta";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <main>
      <HeroScrollTransition
        hero={<Hero posterSrc="https://picsum.photos/seed/reclaim-hero/1920/1080" />}
        pressLogoWall={<PressLogoWall />}
      />
      <Philosophy />
      <ServicesTeaser />
      <CuratedCredibility />
      <Testimonials />
      <TherapyHighlight />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 8: Run all tests to verify the full suite passes**

Run: `npm run test`
Expected: PASS, all test files green.

- [ ] **Step 9: Run the production build**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 10: Commit**

```bash
git add reclaim-integrative/src/components/home/final-cta.tsx reclaim-integrative/src/components/home/final-cta.test.tsx reclaim-integrative/src/app/page.tsx reclaim-integrative/src/app/page.test.tsx
git commit -m "feat: assemble full 8-section homepage"
```

---

## Task 17: Visual verification pass (preview tools)

**Files:** none created; this task verifies the assembled output from Tasks 1-16 using the browser preview tools per the `demo-site` skill's verification discipline.

**Interfaces:**
- Consumes: the running dev server from Task 1.

- [ ] **Step 1: Configure the dev server launch config**

If `.claude/launch.json` does not already have an entry for this project, add one:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "reclaim-integrative",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3000
    }
  ]
}
```

- [ ] **Step 2: Start the server and load the homepage**

Use `preview_start` with name `reclaim-integrative`, then `preview_screenshot` the full homepage.
Expected: cool stone canvas, charcoal-navy text, hero video/poster fills the first viewport with exactly one gold CTA visible, no eyebrow badge, no ticker.

- [ ] **Step 3: Verify responsive breakpoints**

Use `preview_resize` with presets `mobile`, `tablet`, `desktop` and screenshot each.
Expected: nav collapses appropriately, services bento stacks to a single column on mobile, testimonials scroll-snap remains usable by touch.

- [ ] **Step 4: Verify reduced-motion behavior**

Use `preview_eval` to set `window.matchMedia('(prefers-reduced-motion: reduce)')` emulation if supported by the preview tool, or inspect via devtools emulation; reload and confirm ScrollReveal sections appear immediately without animating.

- [ ] **Step 5: Verify contrast**

Use `preview_inspect` on the hero headline, the gold CTA text, and the sage stat-strip numbers against their backgrounds; confirm each meets WCAG AA (4.5:1 for body text, 3:1 for large text) using the computed colors returned.

- [ ] **Step 6: Check console and network for errors**

Use `preview_console_logs` (level: error) and `preview_network` (filter: failed).
Expected: no errors, no failed requests (the Picsum placeholder images should load successfully given the `next.config.ts` remote pattern from Task 11).

- [ ] **Step 7: Report results with evidence**

Summarize what was verified (screenshots, breakpoints checked, contrast values, console/network status) rather than declaring the homepage "done" without this evidence, per the `demo-site` skill's verification-before-reporting rule.
