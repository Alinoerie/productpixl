/**
 * Simple in-memory token-bucket rate limiter.
 * Not distributed — use Upstash Redis in production for multi-instance deployments.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count++;
  buckets.set(key, bucket);
  return bucket.count <= limit;
}
