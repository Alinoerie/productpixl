# ProductPixl (`cursorproductpixl`)

Listing studio for marketplace sellers: one product photo → gallery images + conversion-focused copy.

## Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- PostgreSQL (Supabase) + Prisma
- NextAuth v5 — **Google OAuth only** (JWT sessions)
- Inngest background jobs
- Cloudinary storage
- Replicate (`google/nano-banana-pro`, `google/gemini-3-flash`)
- Tavily research
- Stripe credit packs (optional)

## Brand

See **[docs/BRAND.md](docs/BRAND.md)** — **Copper Horizon** palette (copper CTA, linen background, teal for EU/RUFUS story). Positioning: photo-first, pay-per-credit, Amazon + Bol.com.

Marketing pages use real PHOILA pipeline samples in **`public/showcase/`** (Zealots hand soap, skincare, Danish chair) — sourced from local generation runs.

## Setup

1. Copy `.env.example` to `.env.local` and fill in credentials.
2. `pnpm install`
3. `pnpm db:push` (loads `.env.local` via script)
4. Dev (port **3001** if 3000 is taken):

```bash
pnpm dev
# separate terminal — point Inngest at :3001
pnpm inngest:dev
```

5. Google OAuth redirect URIs (Google Cloud Console → Credentials → your OAuth client):
   - Local: `http://localhost:3001/api/auth/callback/google`
   - Production: `https://productpixl.vercel.app/api/auth/callback/google`
6. Set `AUTH_URL=http://localhost:3001` in `.env.local` (production Vercel: `AUTH_URL=https://productpixl.vercel.app`)

## Features

| Feature | Route |
|--------|--------|
| Dashboard & projects | `/dashboard`, `/projects` |
| Image pipeline (L1/L3/L4/L8) | `/generate` |
| Listing copy | `/copy` |
| Brand profile (colors, tone, logo) | `/brand` |
| Free listing grader (A–F) | `/grader` |
| Spot-edit single module | Product page → 1 credit |
| Export hub (images + copy JSON/CSV/TXT) | `/products/[id]#export` |
| Marketplaces | Amazon US/UK/DE, Bol.com, Shopify |

**Credits:** 10 free on signup · 1 credit per image run, copy run, or spot-edit.

**Studio UX:** Project handoffs via `?productId=` on generate/copy, listing readiness checklist with section jump nav, export-ready and failed-project filters, marketplace-aware export (txt/csv/json + gallery ZIP), in-app unsaved guards on project/copy/brand pages, failed-module retry in gallery, payment success polling after Stripe checkout, grader → copy draft flow with persisted grades, marketplace guidance in generate/copy studios, smart pack recommendations on pricing, collapsible listing bullets on mobile, mobile More menu for Brand/Credits, debounced project search, re-grade from readiness checklist, live dashboard run polling, marketplace labels on project cards, accessible delete confirmation, clickable grade badge, export readiness checklist, screen-reader char counters in copy/grader studios, sticky studio steppers with live status, richer account orders empty state, brand preview mockup, login onboarding steps, pricing comparison cards, animated studio success banners, public pricing page with sign-in CTAs, first-run dashboard onboarding, grader import success banner in copy studio, logged-out grader → copy handoff with draft preservation, filter-aware projects empty states, grader grade toast + mobile scroll, copy completion parity with generate, Open Graph metadata for sharing, new project onboarding on product pages, generate failure recovery with retry, and marketing nav links to public pricing.

## Pipeline docs

- [`docs/image-pipelines/`](docs/image-pipelines/)
- [`docs/text-pipelines/amazon-listing-copy.md`](docs/text-pipelines/amazon-listing-copy.md)

## Manual test checklist

- [ ] Sign in with Google → dashboard shows 10 credits
- [ ] `/dashboard` — first-run welcome copy; hero stats link to projects, export-ready, and failed runs; active runs panel updates live; empty state includes free grader CTA
- [ ] `/projects` — search/filter (debounced search, failed, export-ready, queued), filter-specific empty states, marketplace on cards, open generate or copy handoffs; empty studio includes free grader CTA
- [ ] `/brand` — live listing preview mockup, profile complete badge, mobile save bar, unsaved navigation guard
- [ ] `/generate` — sticky stepper with pipeline status, marketplace guidance, navigation guard, gallery ZIP on completion, failure recovery with retry
- [ ] `/copy` — sticky stepper while generating, regenerate copy, bullet add/remove, marketplace guidance, char counter a11y, mobile save bar, unsaved guard, grader import scrolls to success banner
- [ ] `/grader` — grade listing without login; grade toast + mobile results scroll; char counter a11y; hand off to copy studio with draft preserved; mobile sticky bar respects logged-out layout
- [ ] `/products/[id]` — new project onboarding card, readiness checklist with re-grade, clickable grade badge, export checklist, section nav below header, collapsible bullets on mobile, marketplace export (ZIP + txt/csv/json), gallery filters + failed-module retry, spot-edit on completed assets
- [ ] `/account` — balance, credit usage guide, orders empty state with pack CTA, sign out, payment return banner
- [ ] `/login` — onboarding steps, callback destination hint, link to free grader
- [ ] `/pricing` — public when logged out; sign-in CTA on packs; highlighted comparison cards, smart pack recommendation, checkout return banner

## Stub mode

Without `REPLICATE_API_TOKEN`, analyze/generate return demo data so the UI remains testable.
