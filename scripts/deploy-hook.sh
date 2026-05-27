#!/bin/bash
# Runs before every Vercel build.
# On production deployments, syncs the Prisma schema to the database first.
# This prevents "table/column does not exist" errors after schema changes.

set -e

if [ "$VERCEL_ENV" = "production" ]; then
  echo "==> [deploy-hook] Production deploy — pushing schema changes to database..."
  # Load production env vars (set by Vercel from vercel env)
  set -a
  source .env.production.local 2>/dev/null || true
  set +a
  npx prisma db push --skip-generate --accept-data-loss
  echo "==> [deploy-hook] Schema push complete."
else
  echo "==> [deploy-hook] Preview/dev build — skipping schema push."
fi

# Run the actual build
echo "==> [deploy-hook] Starting build..."
next build
