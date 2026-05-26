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

5. Google OAuth redirect: `http://localhost:3001/api/auth/callback/google`
6. Set `AUTH_URL=http://localhost:3001` in `.env.local`

## Features

| Feature | Route |
|--------|--------|
| Image pipeline (L1/L3/L4/L8) | `/generate` |
| Listing copy | `/copy` |
| Brand profile (colors, tone) | `/brand` |
| Free listing grader (A–F) | `/grader` |
| Spot-edit single module | Product page → 1 credit |
| Marketplaces | Amazon US/UK/DE, Bol.com, Shopify |

**Credits:** 10 free on signup · 1 credit per image run, copy run, or spot-edit.

## Pipeline docs

- [`docs/image-pipelines/`](docs/image-pipelines/)
- [`docs/text-pipelines/amazon-listing-copy.md`](docs/text-pipelines/amazon-listing-copy.md)

## Manual test checklist

- [ ] Sign in with Google → dashboard shows 10 credits
- [ ] `/grader` — grade listing without login
- [ ] `/brand` — save colors/tone → reflected in generation
- [ ] `/generate` — marketplace picker + pipeline completes
- [ ] `/products/[id]` — spot-edit on completed asset
- [ ] `/copy` — Bol.com or EU marketplace copy

## Stub mode

Without `REPLICATE_API_TOKEN`, analyze/generate return demo data so the UI remains testable.
