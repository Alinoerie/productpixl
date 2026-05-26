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

- [ ] Playbook run wizard: brand → products → confirm credits → queue Inngest jobs
- [ ] Clone listing: variations, translations, catalog scale (1 → N SKUs)
- [ ] Listing builder: multi-SKU batch from spreadsheet/CSV import
- [ ] Save playbook configs to **My Playbooks** (template + brand + prompts)
- [ ] Wire playbook slug into prompt builder + image/copy pipelines
- [ ] Enable `POST /api/playbooks/run` (currently returns 503 until execution ships)

## Phase 3 — Visual template library

- [ ] Seed template gallery (A+, infographics, lifestyle, UGC, Shopify, TikTok)
- [ ] Filters: category, channel, text/no-text, industry, format
- [ ] **Use template** flow → prefill generate wizard with template + brand palette swap
- [ ] Track `templateSlug` on products

## Phase 4 — Multi-brand & catalog scale

- [ ] Migrate legacy `BrandProfile` → default `Brand` row per user
- [ ] Brand profile fields: language, tagline, tone, audience, values, aesthetic
- [ ] Projects: bulk actions, playbook/template filters at scale
- [ ] Team members & brand limits per plan tier

## Phase 5 — Billing & production

- [ ] Stripe checkout + subscriptions for Growth / Scale (monthly credits allocation)
- [ ] Plan enforcement: brand count, team seats, Clone/Steal-the-Look gates on Scale+
- [ ] Enterprise contact flow + API/MCP placeholders
- [ ] Production Inngest on Vercel (see `docs/INNGEST_VERCEL.md`)

## Navigation map

| Item | Route | Notes |
|------|-------|-------|
| Content studio | `/studio` | Home hub |
| Image studio | `/studio/images` | Gallery generation |
| Copy studio | `/studio/copy` | Listing copy |
| Projects | `/projects` | Canonical project list |
| Project detail | `/products/[id]` | Legacy URL kept for deep links |
| Listing builder | `/batch/listing-builder` | Phase 2 placeholder |
| Clone catalog | `/batch/clone` | Phase 2 placeholder |
| Expert playbooks | `/playbooks` | Preview only until Phase 2 |
| My playbooks | `/my-playbooks` | Saved templates |
| Visual templates | `/templates` | Template gallery |
| Brand profile | `/brand` | Active brand kit |
