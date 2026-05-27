# ProductPixl — Product roadmap

Phased plan for sidebar navigation, multi-brand, playbooks, templates, batch catalog tools, and subscription pricing.

## Phase 1 — Foundation (shipped)

- [x] Sidebar layout with collapse toggle, Upgrade & Invite actions
- [x] Brand switcher + create brand (`/brands/new`)
- [x] Auth gate: login required before any app/marketing surface (except login + legal)
- [x] Subscription pricing UI (Growth / Scale / Enterprise at 50% competitor rates)
- [x] Prisma: extended `Brand`, `SavedPlaybook`, `PlaybookRun`, product metadata tags
- [x] **Projects** as canonical catalog (`/projects`); `/products` redirects with filters
- [x] Image studio + Copy studio with seller-friendly errors and reset-stuck-run UX
- [x] Onboarding aligned with brand kit (listing identity, visual system, copy voice)
- [x] Playbooks + batch nav with honest Phase 2 preview (no fake batch runs)
- [x] Marketplace export packs (Bol.com / Shopify ZIP: listing + images + README)

## Phase 2 — Playbooks & batch runs

- [x] Playbook run wizard: brand → products → confirm credits → queue Inngest jobs
- [x] Clone listing: variations, translations, catalog scale (1 → N SKUs)
- [x] Listing builder: multi-SKU batch from spreadsheet/CSV import
- [x] Save playbook configs to **My Playbooks** (template + brand + prompts)
- [x] Wire playbook slug into prompt builder + image/copy pipelines
- [x] Enable `POST /api/playbooks/run` (batch execution via credits)

## Phase 3 — Visual template library

- [x] Seed template gallery (A+, infographics, lifestyle, UGC, Shopify, TikTok)
- [x] Filters: category, channel, text/no-text, industry, format
- [x] **Use template** flow → prefill generate wizard with template + brand palette swap
- [x] Track `templateSlug` on products

## Phase 4 — Multi-brand & catalog scale

- [x] Migrate legacy `BrandProfile` → default `Brand` row per user
- [x] Brand profile fields: language, tagline, tone, audience, values, aesthetic
- [x] Projects: bulk actions, playbook/template filters at scale
- [ ] Team members & brand limits per plan tier (soft UI limit only; billing deferred)

## Phase 5 — Billing & production

- [ ] Stripe checkout + subscriptions for Growth / Scale (monthly credits allocation)
- [ ] Plan enforcement: brand count, team seats, Clone/Steal-the-Look gates on Scale+
- [ ] Enterprise contact flow + API/MCP placeholders
- [x] Production Inngest on Vercel (see `docs/INNGEST_VERCEL.md`)

## Navigation map

| Item | Route | Notes |
|------|-------|-------|
| Content studio | `/studio` | Home hub |
| Image studio | `/studio/images` | Listing gallery L1–L12 |
| A+ content studio | `/studio/aplus` | A+ modules M1–M15 |
| Video studio | `/studio/video` | Minimax image-to-video |
| Copy studio | `/studio/copy` | Multi-marketplace listing copy |
| Projects | `/projects` | Canonical project list |
| Project detail | `/products/[id]` | Legacy URL kept for deep links |
| Listing builder | `/batch/listing-builder` | CSV batch intake |
| Clone catalog | `/batch/clone` | Variation / translation clone |
| Expert playbooks | `/playbooks` | Playbook catalog |
| My playbooks | `/my-playbooks` | Saved templates |
| Visual templates | `/templates` | Template gallery |
| Brand profile | `/brand` | Active brand kit |
