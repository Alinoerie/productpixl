# Connect Inngest on Vercel (P0)

Image and copy generation queue background jobs through [Inngest](https://www.inngest.com/). On Vercel production, the app expects `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` from the Marketplace integration.

## Steps (about 5 minutes)

1. Open **[Inngest on Vercel Marketplace](https://vercel.com/marketplace/inngest)**.
2. Click **Install** / **Add integration**.
3. Select the **productpixl** team project (production).
4. Accept terms and complete connect — Vercel injects env vars automatically.
5. **Redeploy production** (Deployments → latest → Redeploy, or push to `main`).

## Verify

```bash
# Local env pull (optional — sync keys for smoke test)
vercel env pull .env.local

# Readiness
pnpm test:e2e-ready

# Production smoke (homepage + optional copy pipeline poll)
SMOKE_BASE_URL=https://productpixl.vercel.app pnpm test:smoke:prod
```

Expected:

- `Inngest jobs` ✓ in `test:e2e-ready`
- `/api/inngest` returns 200 or 405 on production
- Copy pipeline poll reaches `COMPLETE` within ~2 minutes in `test:smoke:prod`

## Local development

No Marketplace keys required — pipelines run **inline** in `pnpm dev` by default (`shouldUseInlinePipeline()`).

Optional: run Inngest dev server alongside the app:

```bash
pnpm dev
pnpm inngest:dev   # separate terminal
```

Set `PIPELINE_INLINE=0` to force cloud Inngest locally.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Runs stuck at **Queued** | Integration not connected or deploy before keys existed → redeploy |
| `503 INNGEST_NOT_CONFIGURED` | Missing `INNGEST_EVENT_KEY` on Vercel → reinstall integration |
| Smoke test times out at QUEUED | Same as above; confirm keys in Vercel → Settings → Environment Variables |

Support: [support@productpixl.app](mailto:support@productpixl.app)
