#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Stopping stale dev processes on 3001/3002..."
fuser -k 3001/tcp 3002/tcp 2>/dev/null || true

echo "Clearing .next cache..."
rm -rf .next

echo "Ready. Run in two terminals:"
echo "  pnpm dev"
echo "  pnpm inngest:dev"
