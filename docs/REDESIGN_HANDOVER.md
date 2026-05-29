# ProductPixl — Full Redesign Brief for Orcha

## Context

ProductPixl is a Next.js 15 listing studio: one product photo → AI-generated gallery images + copy for Amazon/European marketplace sellers. The current design has an old "Studio Iris" indigo palette. A full redesign has been approved.

**Goal:** Replace the entire visual system with amber `#F59E0B` on near-black `#0F0E0D`.

---

## 1. Brand Colors — REPLACE EVERYTHING

### New palette (amber on dark)

| Token | Hex | Use |
|---|---|---|
| `--amber` | `#F59E0B` | All CTAs, links, focus rings, brand accents |
| `--amber-light` | `#FCD34D` | Hover states, highlights |
| `--amber-dark` | `#D97706` | Active/pressed states |
| `--bg-dark` | `#0F0E0D` | Primary dark background |
| `--bg-dark-2` | `#1C1917` | Card/surface dark background |
| `--bg-dark-3` | `#292524` | Elevated surfaces, inputs |
| `--text-primary` | `#FFFFFF` | Headings on dark |
| `--text-secondary` | `#A8A29E` | Body text on dark, muted |
| `--text-tertiary` | `#78716C` | Placeholder, disabled |

### Semantic tokens

| Token | Hex | Use |
|---|---|---|
| `--success` | `#059669` | Grades A, completed states |
| `--warning` | `#D97706` | Paywall, low credits |
| `--error` | `#DC2626` | Failures, grade F |

### Where to apply

- `src/app/globals.css` — all CSS custom properties pointing to old colors must be updated
- Every component that uses `--accent`, `--primary`, `--brand`, indigo hex values — update to amber equivalents
- Search entire codebase for `6366F1` (old iris indigo) and `indigo` color classes — replace with amber
- Search for `#0F172A` (old Ink) — update to new dark values
- Search for `slate` UI colors — verify contrast against new dark bg

---

## 2. Logo + Favicon

### Logo
- **Source:** `/home/alisionary/.hermes/image_cache/img_45271980c7bc.png`
- **Dest:** `public/logo.png` (replace existing)
- The logo file shows a geometric mark in amber/gold tones

### Favicon
- Already exists at `public/favicon.ico` (644 bytes)
- Verify it uses amber, not indigo — if wrong, regenerate or extract from logo

### Layout
In `src/app/layout.tsx`:
```
icon: /favicon.ico
appleTouchIcon: /logo.png
```

---

## 3. Light Mode — Ship Together

Do NOT build dark-first and add light as a separate feature. Both themes ship together.

### Implementation approach

Use Tailwind `dark:` classes paired with amber. Example pattern:

```html
<button class="bg-amber-500 hover:bg-amber-400 text-black font-semibold
               dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black">
  CTA Text
</button>
```

### Light mode colors

| Token | Hex | Use |
|---|---|---|
| `--bg-light` | `#FAFAF9` | Page background (warm white) |
| `--bg-light-2` | `#F5F5F4` | Card surfaces |
| `--text-light` | `#1C1917` | Body text on light |
| `--text-light-secondary` | `#57534E` | Muted text on light |

Amber `#F59E0B` remains the accent color in both modes.

### Verification

Test every page in both dark and light mode. Amber must be visible and correct in both.

---

## 4. Empty States — No Indigo Default

Empty states must NOT show indigo/brand color as a default.

Options:
1. Show "Generate with AI" prompt with amber accent
2. Show a clean empty state with no color accent

Do NOT leave indigo placeholder content. Do NOT default to brand color fills in empty cards.

---

## 5. Page Load Animation — Fade-up with GSAP

GSAP is free/open-source. Add a single fade-up animation on page load.

### Implementation

In your root layout or a client-side page wrapper:

```tsx
// Use GSAP to animate main content on load
// Target: main content area
// Animation: opacity 0 → 1, translateY 20px → 0, duration 0.6s, ease power2.out
// Trigger: onMount / useEffect
```

Keep it simple. One fade-up, no staggering, no multiple transitions.

---

## 6. Pages to Update

Every page needs the new amber/dark treatment. Priority order:

### P0 — Must update
- `/` — Homepage (redesigned recently, apply new palette)
- `/studio` — Content studio home
- `/studio/images` — L1–L12 module picker
- `/studio/aplus` — A+ content studio
- `/pricing` — Show 10 starter credits, credit system
- `/layout.tsx` — Root layout (fonts, logo, dark mode class)

### P1 — Apply palette once P0 is done
- `/studio/video`
- `/studio/copy`
- `/projects`
- `/products/[id]`
- `/onboarding`
- `/brand`
- `/brands`
- `/grader`
- `/playbooks`
- `/my-playbooks`
- `/templates`
- `/batch/listing-builder`
- `/batch/clone`

---

## 7. Components to Audit

Search and update all components using old colors:

```bash
# Find files with old indigo
grep -r "6366F1" --include="*.tsx" --include="*.css" .
grep -r "indigo" --include="*.tsx" --include="*.css" .
grep -r "#0F172A" --include="*.tsx" --include="*.css" .
```

Every match needs to be updated to the new amber/dark palette.

---

## 8. Specific Files

### `src/app/globals.css`
- Replace all `--accent`, `--primary` with amber `#F59E0B`
- Replace dark background values with `#0F0E0D`
- Set up proper Tailwind v4 dark mode using `class` strategy (check if existing project uses `class` or `media`)

### `src/app/layout.tsx`
- Logo: `icon=favicon.ico`, `appleTouchIcon=logo.png`
- Verify dark mode class is applied to `<html>` or `<body>`
- Remove any hardcoded old palette values

### `src/lib/marketing-usp.ts`
- Update to reflect new amber brand — check tagline, USP copy, any hardcoded color references in marketing text

### `docs/BRAND.md`
- Rewrite to document amber `#F59E0B` on near-black `#0F0E0D`
- Remove all references to Studio Iris / indigo / cyan palette
- Document light mode colors as secondary theme

---

## 9. Credit System (verify display)

- 1 credit = 1 image generation
- Exports are free
- Starter: 10 credits, one-time, no card
- `/pricing` page must show this clearly

Verify the pricing page reflects these rules.

---

## 10. Auth (verify UI consistency)

- Google OAuth + email magic link
- Both buttons must use amber styling
- No indigo anywhere in the auth flow

---

## 11. Testing Checklist

### Before declaring done, verify:

```bash
pnpm dev          # runs on port 3001
pnpm test:e2e-ready   # full env check
```

### Manual checks (both themes):

- [ ] Homepage loads with amber on dark
- [ ] `/studio` — studio home uses amber palette
- [ ] `/studio/images` — L1–L12 picker, amber accent, no indigo defaults
- [ ] Empty states — no indigo, no broken empty state layouts
- [ ] Dark mode — every page, amber visible throughout
- [ ] Light mode — every page, amber accent visible and correct
- [ ] Page load — fade-up animation fires on first visit
- [ ] Logo — amber/gold geometric mark in nav
- [ ] `/pricing` — 10 starter credits, credit system explained
- [ ] Auth pages — Google OAuth + email magic link, amber buttons
- [ ] No `6366F1` (old indigo) anywhere in the codebase
- [ ] No indigo Tailwind classes remaining

---

## 12. Stack Reference

```
Next.js 15, React 19, TypeScript
Tailwind CSS v4
PostgreSQL (Supabase) + Prisma
NextAuth v5 — Google OAuth + email magic link
Inngest (background jobs)
Cloudinary (storage)
Replicate (AI image generation)
Stripe (credit packs)
GSAP (animations — free tier)
```

## 13. Env vars needed for full run

If you need to test generation pipelines:
- `REPLICATE_API_TOKEN` — for image generation
- `TAVILY_API_KEY` — for research
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — for payments

Without these, the UI is testable but generation will return demo data.

## 14. Git + Deploy

```
Repo: https://github.com/Alinoerie/productpixl.git
Branch: main
Local path: /home/alisionary/Documents/cursorproductpixl
Vercel project: productpixl
```

Commit and push to `main`. Vercel auto-deploys on push to main.
