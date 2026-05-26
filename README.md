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
| Export hub (images + copy JSON) | `/products/[id]#export` |
| Marketplaces | Amazon US/UK/DE, Bol.com, Shopify |

**Credits:** 10 free on signup · 1 credit per image run, copy run, or spot-edit.

**Studio UX:** Project handoffs via `?productId=` on generate/copy, listing readiness checklist with section jump nav, export-ready and failed-project filters, gallery ZIP download, in-app unsaved guards on project/copy/brand pages, failed-module retry in gallery, payment success polling after Stripe checkout, and grader → copy draft flow with persisted grades.

## Pipeline docs

- [`docs/image-pipelines/`](docs/image-pipelines/)
- [`docs/text-pipelines/amazon-listing-copy.md`](docs/text-pipelines/amazon-listing-copy.md)

## Manual test checklist

- [ ] Sign in with Google → dashboard shows 10 credits
- [ ] `/dashboard` — hero stats link to projects, export-ready, and failed runs when present
- [ ] `/projects` — search/filter (failed, export-ready, queued), open generate or copy handoffs
- [ ] `/grader` — grade listing without login; hand off to copy studio when signed in
- [ ] `/brand` — save colors/tone, mobile save bar, unsaved navigation guard
- [ ] `/generate` — marketplace picker + pipeline completes → export/copy CTAs
- [ ] `/copy` — regenerate copy, bullet add/remove, per-field copy, fixed mobile save bar, unsaved guard
- [ ] `/generate` — navigation guard during multi-step runs, gallery ZIP on completion
- [ ] `/products/[id]` — readiness checklist, section nav, export hub (ZIP + JSON), gallery filters + failed-module retry, spot-edit on completed assets
- [ ] `/pricing` — Stripe checkout return shows credit refresh banner

## Stub mode

Without `REPLICATE_API_TOKEN`, analyze/generate return demo data so the UI remains testable.
