# ProductPixl handoff — Claude Code takeover

You are taking over **ProductPixl** after a large implementation sprint in Cursor. Your job is to **operate, verify, polish, and finish remaining ops/docs** — not re-implement what is already shipped unless something is broken.

## Project root

```
/home/alisionary/Documents/cursorproductpixl
```

**Production:** https://productpixl.vercel.app  
**Vercel project:** `productpixl` (team: agentle)  
**Last prod deploy:** succeeded (`vercel --prod --yes`)  
**Local dev port:** `3001` (`pnpm dev`)

## Authoritative plan (read-only — do NOT edit)

```
/home/alisionary/.cursor/plans/full_productpixl_ship_4afa8160.plan.md
```

All 9 waves (0–8) from that plan were implemented in code. The plan todos are marked complete. Prior Cursor session transcript (full context):

```
/home/alisionary/.cursor/projects/home-alisionary-Documents/agent-transcripts/f8dbd5e4-f1b2-4fbd-af2a-f907334e76cd/f8dbd5e4-f1b2-4fbd-af2a-f907334e76cd.jsonl
```

Search that file for keywords before guessing intent.

---

## Hard constraints from the founder (do not violate)

1. **Stripe subscriptions:** intentionally placeholder. Growth/Scale/Enterprise monthly CTAs stay **`comingSoon: true`** in `src/lib/pricing-plans.ts`. Do **not** ship live subscription billing unless explicitly asked.
2. **Growth/Scale features:** batch, clone, playbooks at scale, A+, etc. are **unlocked for any user with credits** — not gated on subscription tier.
3. **One-time credit packs:** existing Stripe checkout path stays as-is (optional env); paywall copy in `src/components/ui/credits-paywall-banner.tsx` still mentions placeholder when Stripe missing.
4. **Video:** Replicate image-to-video — model pinned at `minimax/video-01-live` in `src/pipelines/video-pipeline-core.ts` (override via env only if we add that later).
5. **Listing L1–L12:** already shipped; verify/docs only unless bugs found.
6. **Team members / full invite flow:** explicitly **out of scope** for this sprint — roadmap checkbox still open.

---

## What was shipped (summary by wave)

### Wave 0 — Foundation
- **Prisma:** `Product.listingCopies[]` (was singular `listingCopy`); `ListingCopy @@unique([productId, marketplace])`; `Asset.videoUrl`, `targetWidth`, `targetHeight`; `PlaybookRun.totalCredits`, `completedCount`
- **Schema pushed** to Supabase with `pnpm exec prisma db push --accept-data-loss`
- **Image engine:** `src/pipelines/image-gen.ts` — `generateRawImage()`, `AspectRatio`, post-process split
- **Post-process:** `src/pipelines/post-process/listing.ts`, `aplus.ts`
- **Composite fallback:** `src/pipelines/composite-fallback.ts` (sharp overlay); wired for scale-critical listing modules L2, L3, L11, L12 in `src/pipelines/image-pipeline-core.ts`
- **Listing copy helper:** `src/lib/listing-copy.ts` — `pickListingCopy`, `primaryListingCopy`, `listingCopyWhere`

### Wave 1 — A+ pipeline (M1–M15)
- `src/pipelines/aplus-modules.ts`
- `src/pipelines/aplus-prompt-builder.ts`
- `src/pipelines/aplus-pipeline-core.ts`
- `src/inngest/functions/aplus-pipeline.ts`
- `src/lib/run-aplus-pipeline-async.ts`
- `src/app/api/generate/aplus/route.ts` + `prompts/route.ts`
- `src/app/(dashboard)/studio/aplus/page.tsx`
- `src/components/studio/aplus-studio-workspace.tsx`
- Credits: `quoteAplusRun`, M1–M15 weights in `src/lib/credit-pricing.ts`
- Nav: `STUDIO_ROUTES.aplus` in `src/lib/studio-routes.ts`, sidebar + studio tabs

### Wave 2 — Templates + playbooks
- `templateContextBlock()` wired through image/A+ generate + prompts routes
- `Product.templateSlug` persisted on create/update
- `PLAYBOOKS_ENABLED = true` in `src/app/api/playbooks/run/route.ts`
- `src/lib/playbooks/catalog.ts` — module sets, `playbookContextBlock()`, credit estimates
- `src/components/playbooks/playbook-run-wizard.tsx`
- `src/components/playbooks/playbook-rerun-button.tsx`
- `src/inngest/functions/playbook-pipeline.ts`
- Playbook context injected in listing/A+ prompt builders

### Wave 3 — Copy Phase 2 (multi-marketplace)
- `src/pipelines/copy-gen.ts` — DE/NL/FR tone, Bol mapping, backend keyword **byte validator** (250-byte Amazon US) with regen loop
- `src/pipelines/copy-pipeline-core.ts` — `runCopyPipelineMulti()`, compound unique upserts
- `src/app/api/generate/copy/route.ts` — accepts `marketplaces[]`
- `src/components/copy/copy-workspace.tsx` — POSTs all selected markets
- Prisma queries migrated to `listingCopies` + `primaryListingCopy()` on server pages/APIs

### Wave 4 — Video studio
- `src/lib/video-formats.ts`
- `src/pipelines/video-pipeline-core.ts`
- `src/inngest/functions/video-pipeline.ts`
- `src/lib/run-video-pipeline-async.ts` — credit refund on failure
- `src/app/api/generate/video/route.ts` — Inngest dispatch
- `src/components/studio/video-studio-workspace.tsx` — polling + export when COMPLETE
- `src/lib/cloudinary.ts` — `uploadVideoUrlToCloudinary`

### Wave 5 — Batch tools
- `src/lib/batch/types.ts`, `csv.ts`
- `src/app/api/batch/listing-builder/route.ts`
- `src/app/api/batch/clone/route.ts`
- `src/inngest/functions/batch-pipeline.ts` — sequential fan-out, 12s sleep between Replicate calls
- `src/components/batch/listing-builder-workspace.tsx`
- `src/components/batch/clone-catalog-workspace.tsx`
- Pages: `src/app/(dashboard)/batch/listing-builder/page.tsx`, `clone/page.tsx`

### Wave 6 — Phase 4 (brand + projects scale)
- `src/lib/brands.ts` — one-time `BrandProfile` → `Brand` migration, `SOFT_BRAND_LIMIT = 5`
- `src/app/api/brand-profile/route.ts` — writes `Brand` only
- `src/app/(dashboard)/projects/page.tsx` — filters: `playbookSlug`, `templateSlug`, `pipelineType`
- `src/components/projects/projects-filter-bar.tsx`, `projects-bulk-actions.tsx`, `projects-selectable-grid.tsx`
- `src/app/api/projects/bulk/route.ts` — bulk delete, export ZIP meta, re-run playbook
- Pricing copy updated — features available with credits today

### Wave 7 — Email / demo / pricing polish
- `src/lib/email/resend-config.ts` — `getEmailConfigStatus()`
- `src/components/account/email-config-banner.tsx`
- Demo + guide-pack copy aligned with actual email behavior

### Wave 8 — Tests + deploy
- `scripts/e2e-readiness.ts`, `scripts/api-smoke-test.ts` extended
- `docs/PRODUCT-ROADMAP.md` — Phases 2–4 checked; Phase 5 Stripe left open
- `src/lib/site-url.ts` — empty `AUTH_URL` no longer breaks build
- **`pnpm build` passes**; production deploy done

---

## Architecture map (where everything lives)

### Pipelines (core logic)
| Area | Path |
|------|------|
| Listing modules L1–L12 | `src/pipelines/modules.ts` |
| Listing prompts | `src/pipelines/prompt-builder.ts` |
| Listing pipeline | `src/pipelines/image-pipeline-core.ts` |
| Image gen + raw Replicate | `src/pipelines/image-gen.ts` |
| Composite fallback | `src/pipelines/composite-fallback.ts` |
| A+ modules M1–M15 | `src/pipelines/aplus-modules.ts` |
| A+ prompts | `src/pipelines/aplus-prompt-builder.ts` |
| A+ pipeline | `src/pipelines/aplus-pipeline-core.ts` |
| Copy generation | `src/pipelines/copy-gen.ts` |
| Copy pipeline | `src/pipelines/copy-pipeline-core.ts` |
| Tavily research | `src/pipelines/tavily.ts` |
| Video pipeline | `src/pipelines/video-pipeline-core.ts` |
| Video formats | `src/lib/video-formats.ts` |

### PHOILA spec docs (source of truth for prompts/dims)
| Doc | Path |
|-----|------|
| Listing L1–L12 | `docs/image-pipelines/listing.md` |
| A+ M1–M15 | `docs/image-pipelines/aplus.md` |
| MVP listing notes | `docs/image-pipelines/mvp.md` |
| Copy pipeline | `docs/text-pipelines/amazon-listing-copy.md` |

### Inngest
| Item | Path |
|------|------|
| Client + event names | `src/inngest/client.ts` |
| HTTP serve route | `src/app/api/inngest/route.ts` |
| Functions | `src/inngest/functions/{image,aplus,copy,video,playbook,batch}-pipeline.ts` |
| Config / inline dev | `src/lib/inngest-config.ts` |
| Async runners | `src/lib/run-{image,aplus,copy,video}-pipeline-async.ts` |

**Events registered:**
- `productpixl/image-pipeline.run`
- `productpixl/aplus-pipeline.run`
- `productpixl/copy-pipeline.run`
- `productpixl/video-pipeline.run`
- `productpixl/playbook-pipeline.run`
- `productpixl/batch-pipeline.run`

### API routes (generation)
| Route | Path |
|-------|------|
| Images | `src/app/api/generate/images/route.ts` + `prompts/route.ts` |
| A+ | `src/app/api/generate/aplus/route.ts` + `prompts/route.ts` |
| Copy | `src/app/api/generate/copy/route.ts` |
| Video | `src/app/api/generate/video/route.ts` |
| Playbooks | `src/app/api/playbooks/run/route.ts` |
| Batch | `src/app/api/batch/listing-builder/route.ts`, `clone/route.ts` |
| Bulk projects | `src/app/api/projects/bulk/route.ts` |
| Pipeline status poll | `src/app/api/products/[id]/status/route.ts` |

### Studio UI
| Surface | Path |
|---------|------|
| Routes constant | `src/lib/studio-routes.ts` |
| Overview | `src/app/(dashboard)/studio/page.tsx` |
| Images wizard | `src/components/generate/generate-wizard.tsx` |
| A+ workspace | `src/components/studio/aplus-studio-workspace.tsx` |
| Copy workspace | `src/components/copy/copy-workspace.tsx` |
| Video workspace | `src/components/studio/video-studio-workspace.tsx` |
| Sidebar nav | `src/components/layout/sidebar-nav-content.tsx` |

### Catalogs
| Catalog | Path |
|---------|------|
| Playbooks | `src/lib/playbooks/catalog.ts` |
| Templates | `src/lib/templates/catalog.ts` |
| Credit pricing | `src/lib/credit-pricing.ts` |
| Pricing plans UI data | `src/lib/pricing-plans.ts` |
| Brands + migration | `src/lib/brands.ts` |
| Listing copy helpers | `src/lib/listing-copy.ts` |

### Prisma schema
```
prisma/schema.prisma
```
Key models: `User`, `Brand`, `BrandProfile` (legacy read fallback), `Product`, `Asset`, `ListingCopy`, `PlaybookRun`, `SavedPlaybook`, `Order`

### Ops docs
| Topic | Path |
|-------|------|
| Roadmap | `docs/PRODUCT-ROADMAP.md` |
| Inngest on Vercel | `docs/INNGEST_VERCEL.md` |
| Stripe setup | `docs/STRIPE_VERCEL.md` |
| Brand guidelines | `docs/BRAND.md` |
| Env template | `.env.example` |
| README (partially stale — see pending) | `README.md` |

---

## Pending / not done (your priority queue)

### P0 — Production blockers (ops, not code)

1. **Connect Inngest on Vercel**  
   - Symptom: runs stuck at **Queued** on production  
   - Fix: https://vercel.com/marketplace/inngest → connect `productpixl` → **redeploy**  
   - Doc: `docs/INNGEST_VERCEL.md`  
   - Verify: `pnpm test:e2e-ready` → `Inngest jobs ✓`  
   - Then: `SMOKE_BASE_URL=https://productpixl.vercel.app pnpm test:smoke:prod`

2. **Reset stuck projects** (1 queued/processing at last check)  
   ```bash
   cd /home/alisionary/Documents/cursorproductpixl
   pnpm reset:stuck
   # or: npx tsx scripts/reset-stuck-products.ts alinoerie@gmail.com
   ```

3. **Verify `EMAIL_FROM` on a verified Resend domain**  
   - Currently: `onboarding@resend.dev` (dev sender)  
   - Banner: `src/components/account/email-config-banner.tsx`  
   - Logic: `src/lib/email/resend-config.ts`

### P1 — Intentionally deferred product work

| Item | Status | Notes |
|------|--------|-------|
| Stripe subscriptions (Growth/Scale monthly) | **Do not build** | `comingSoon: true` on monthly plans |
| Plan enforcement (seats, brand gates by tier) | Open | Soft brand limit only (`SOFT_BRAND_LIMIT = 5`) |
| Team members invite/auth | Open | Roadmap Phase 4 checkbox |
| Enterprise contact + API/MCP placeholders | Open | Phase 5 |
| Production Inngest doc checkbox in roadmap | Open until Marketplace connected | |

### P2 — Polish / docs drift (safe to do)

1. **Update `README.md` routes table** — missing `/studio/aplus`, `/studio/video`, `/batch/*`, playbooks, templates  
2. **Update `docs/PRODUCT-ROADMAP.md` navigation map** — add A+ and Video studio rows  
3. **Optional:** add `REPLICATE_VIDEO_MODEL` env override (model hardcoded today)  
4. **ESLint warnings** — pre-existing in `generate-wizard`, `app-sidebar`, etc.; build still passes  
5. **`pnpm db:push`** — if schema changes again, use:  
   `bash -c 'set -a && . ./.env.local && set +a && pnpm exec prisma db push --accept-data-loss'`

### P3 — Verification checklist (run after Inngest connected)

```bash
cd /home/alisionary/Documents/cursorproductpixl
pnpm install
pnpm build                                    # must pass
pnpm test:e2e-ready                           # env readiness
pnpm test:api                                 # needs dev server on :3002
SMOKE_BASE_URL=https://productpixl.vercel.app pnpm test:smoke:prod
```

**Manual smoke paths:**
- `/studio/images` — L1–L12 module picker, template slug from `/templates`
- `/studio/aplus` — 6–12 modules, brand-registered toggle for M11–M15
- `/studio/copy` — multi-marketplace POST
- `/studio/video` — poll until COMPLETE, export MP4
- `/playbooks/[slug]` — run wizard → Inngest fan-out
- `/batch/listing-builder` — CSV upload
- `/batch/clone` — variation/translation clone
- `/projects` — filters + bulk actions
- `/pricing` — Growth/Scale show features; monthly buttons say coming soon

---

## Important implementation details (avoid regressions)

### ListingCopy migration pattern
Server code uses **`listingCopies`** relation. APIs still expose **`listingCopy`** (singular) for backward compat:

```typescript
import { primaryListingCopy, listingCopyWhere } from "@/lib/listing-copy";
// include: { listingCopies: true }
const listingCopy = primaryListingCopy(product.listingCopies, product.marketplace);
// upsert: where: listingCopyWhere(productId, marketplace)
```

### Local dev vs production pipelines
- **Local (`pnpm dev`):** pipelines run **inline** by default (`shouldUseInlinePipeline()` in `src/lib/inngest-config.ts`) — no Inngest dev server required  
- **Production:** requires `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` from Vercel Marketplace  
- Force cloud locally: `PIPELINE_INLINE=0`

### Scale-critical composite modules
- **Listing:** L2, L3, L11, L12 — scene-only Replicate + sharp product overlay  
- **A+:** M3, M7, M12, M13, M15 — same pattern in `aplus-pipeline-core.ts`

### Credits
- Quoted before every run via `src/lib/credit-pricing.ts`  
- Charged in API routes via `src/lib/require-credits.ts`  
- Refund on video failure mirrors image pattern in `run-video-pipeline-async.ts`

### Test account
- Email used in scripts: `alinoerie@gmail.com`  
- Credits script: `npx tsx scripts/set-user-credits.ts your@email.com 9999999`

---

## Commands cheat sheet

```bash
cd /home/alisionary/Documents/cursorproductpixl
pnpm dev                    # :3001
pnpm inngest:dev            # optional, with PIPELINE_INLINE=0
pnpm build
pnpm db:push                # may need --accept-data-loss via pnpm exec prisma
pnpm test:e2e-ready
pnpm test:api
pnpm test:smoke:prod
pnpm reset:stuck
vercel --prod --yes         # deploy
vercel env pull .env.local  # sync prod env locally
```

---

## Your first session goals (suggested)

1. Read `docs/PRODUCT-ROADMAP.md` and confirm Phase 5 items are still intentionally open.  
2. Run `pnpm test:e2e-ready` — fix **Inngest** connection on Vercel if still failing (ops, not code).  
3. Run `pnpm reset:stuck` if stuck projects remain.  
4. Run production smoke after Inngest is live.  
5. Update `README.md` + roadmap nav map (A+/video/batch routes).  
6. Only touch Stripe/subscription code if the founder explicitly asks.

**Do not edit** `/home/alisionary/.cursor/plans/full_productpixl_ship_4afa8160.plan.md`.

When unsure about prior decisions, search the agent transcript JSONL above before asking the founder.
