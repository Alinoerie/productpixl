# Enable Stripe checkout on Vercel (E)

Credit packs use Stripe Checkout. Checkout opens when `STRIPE_SECRET_KEY` is set; credits are granted after payment via the webhook.

## 1. Stripe Dashboard

1. Create a [Stripe account](https://dashboard.stripe.com/register) (test mode first).
2. **Products → Add product** for each pack (or use inline prices — Price IDs optional):
   - **Starter** — 10 credits (match `CREDIT_PACKAGES.starter` in `src/lib/stripe.ts`, default €29)
   - **Catalog / Growth** — 30 credits (default €79)
3. Copy **Price IDs** (`price_…`) into env vars if you use catalog prices.

## 2. Vercel environment variables

Project **productpixl** → Settings → Environment Variables:

| Variable | Example | Required |
|----------|---------|----------|
| `STRIPE_SECRET_KEY` | `sk_test_…` or `sk_live_…` | Yes — enables checkout |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | Yes — grants credits after pay |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | Recommended |
| `STRIPE_PRICE_STARTER` | `price_…` | Optional |
| `STRIPE_PRICE_GROWTH` | `price_…` | Optional |

Redeploy after saving.

## 3. Webhook endpoint

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://productpixl.vercel.app/api/webhooks/stripe`
3. Event: `checkout.session.completed`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET` on Vercel → redeploy

Local testing with Stripe CLI:

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
# Use the whsec_… from CLI output in .env.local
```

## 4. Verify

```bash
pnpm test:e2e-ready
# Expect: Stripe checkout ✓ and Stripe webhook ✓

# On site: /pricing → Buy Starter pack → complete test payment → credits increase on /account
```

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Buy button disabled / 503 on checkout | Missing or placeholder `STRIPE_SECRET_KEY` |
| Payment succeeds, credits unchanged | Webhook not configured or wrong `STRIPE_WEBHOOK_SECRET` |
| Webhook 400 invalid signature | Redeploy with correct secret; check endpoint URL |

Support: [support@productpixl.app](mailto:support@productpixl.app)
