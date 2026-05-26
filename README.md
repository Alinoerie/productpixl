# ProductPixl (`cursorproductpixl`)

Listing studio for marketplace sellers: one product photo → gallery images + conversion-focused copy.

## Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- PostgreSQL (Supabase) + Prisma
- NextAuth v5 — **Google OAuth only** (JWT sessions)
- Inngest background jobs (Vercel Marketplace in production; inline pipelines in local dev)
- Cloudinary storage
- Replicate (`google/nano-banana-pro`, `google/gemini-3-flash`)
- Tavily research
- Stripe credit packs (optional)

## Brand

See **[docs/BRAND.md](docs/BRAND.md)** — **Studio Iris** palette (indigo CTA, cool slate background, cyan for EU/RUFUS story).

## Setup

1. Copy `.env.example` to `.env.local` and fill in credentials.
2. `pnpm install`
3. `pnpm db:push`
4. Local dev (port **3001**):

```bash
pnpm dev
# Optional — only if testing cloud Inngest locally:
# PIPELINE_INLINE=0 pnpm dev && pnpm inngest:dev
```

5. Google OAuth redirect URIs:
   - Local: `http://localhost:3001/api/auth/callback/google`
   - Production: `https://productpixl.vercel.app/api/auth/callback/google`
6. `AUTH_URL` must match the origin you use locally or on Vercel.

## Routes

| Feature | Route |
|--------|--------|
| Content studio home | `/studio` |
| Image studio | `/studio/images` |
| Listing copy | `/studio/copy` |
| Projects (all SKUs / runs) | `/projects` |
| Project detail | `/products/[id]` |
| Brand onboarding | `/onboarding` |
| Listing brand kit | `/brand` |
| All brands | `/brands` |
| Free listing grader | `/grader` |
| Pricing | `/pricing` |

Legacy `/products` (list) redirects to `/projects`. Legacy `/generate` and `/copy` redirect to `/studio/*`.

**Brand-first flow:** New users complete `/onboarding` (listing identity → visual system → copy voice → launch) before studio access.

**Credits:** Quoted before every run. At **0 credits**, Images/Copy show in-flow paywall; projects, brand kit, grader, and account stay open.

## Production: connect Inngest (required)

See **[docs/INNGEST_VERCEL.md](docs/INNGEST_VERCEL.md)** for the full checklist.

1. [Install Inngest](https://vercel.com/marketplace/inngest) on the **productpixl** Vercel project.
2. Redeploy production.
3. Verify:

```bash
pnpm test:e2e-ready
SMOKE_BASE_URL=https://productpixl.vercel.app pnpm test:smoke:prod
```

## Production: Stripe checkout (optional)

See **[docs/STRIPE_VERCEL.md](docs/STRIPE_VERCEL.md)**. Requires `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on Vercel.

## Testing

| Command | Purpose |
|---------|---------|
| `pnpm test:e2e-ready` | Env, DB, Inngest, Stripe, test account |
| `pnpm test:e2e:install` | Install Playwright Chromium |
| `pnpm test:e2e` | Browser E2E (studio, projects, checkout API) |
| `pnpm test:smoke:prod` | Production HTTP + optional copy pipeline poll |
| `pnpm test:api` | Local authenticated API smoke (dev server on :3002) |

**Test account prep:**

```bash
npx tsx scripts/set-user-credits.ts your@email.com 9999999
npx tsx scripts/reset-stuck-products.ts your@email.com   # if runs stuck at Queued
```

**Suggested journey:** sign in → `/onboarding` → `/studio` → `/studio/images` → open project → `/studio/copy` → export from project page → `/grader` (free).

## Manual test checklist

- [ ] Sign in → `/onboarding` if brand kit incomplete
- [ ] `/studio` — Images + Copy cards; batch/playbooks hint when zero projects
- [ ] `/projects` — filters, brand chips, card grid; `/products` redirects here
- [ ] `/studio/copy?productId=` — jumps to Edit copy when project has listing copy
- [ ] `/products/[id]` — gallery first; export/readiness collapsed until images or copy exist
- [ ] Generation errors show plain language + contact support (no Inngest jargon)
- [ ] `pnpm test:smoke:prod` passes after Inngest connected

## Stub mode

Without `REPLICATE_API_TOKEN`, analyze/generate return demo data so the UI remains testable.

## Pipeline docs

- [`docs/image-pipelines/`](docs/image-pipelines/)
- [`docs/text-pipelines/amazon-listing-copy.md`](docs/text-pipelines/amazon-listing-copy.md)
