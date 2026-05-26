/**
 * Production smoke test — unauthenticated health + optional authenticated pipeline poll.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://productpixl.vercel.app pnpm test:smoke:prod
 *
 * With pipeline verification (needs .env.local + test account):
 *   bash -c 'set -a && . ./.env.local && set +a && SMOKE_BASE_URL=https://productpixl.vercel.app pnpm test:smoke:prod'
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { encode } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // optional for public-only smoke
  }
}

loadEnvLocal();

const BASE_URL = (process.env.SMOKE_BASE_URL ?? "https://productpixl.vercel.app").replace(/\/$/, "");
const TEST_EMAIL = process.env.SMOKE_TEST_EMAIL ?? "alinoerie@gmail.com";
const prisma = new PrismaClient();

type Result = { name: string; ok: boolean; detail: string };

const results: Result[] = [];

function pass(name: string, detail: string) {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name} — ${detail}`);
}

function fail(name: string, detail: string) {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name} — ${detail}`);
}

async function fetchCheck(name: string, path: string, expectStatus: number | number[]) {
  const allowed = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
  try {
    const res = await fetch(`${BASE_URL}${path}`, { redirect: "follow" });
    if (!allowed.includes(res.status)) {
      fail(name, `HTTP ${res.status} (expected ${allowed.join(" or ")})`);
      return null;
    }
    pass(name, `HTTP ${res.status}`);
    return res;
  } catch (err) {
    fail(name, err instanceof Error ? err.message : String(err));
    return null;
  }
}

async function sessionCookie(userId: string, credits: number): Promise<string | null> {
  if (!process.env.AUTH_SECRET) return null;
  const token = await encode({
    token: { sub: userId, id: userId, credits },
    secret: process.env.AUTH_SECRET,
    salt: "authjs.session-token",
  });
  return `authjs.session-token=${token}`;
}

async function main() {
  console.log(`\nProductPixl production smoke — ${BASE_URL}\n`);

  await fetchCheck("Homepage", "/", 200);
  await fetchCheck("Pricing", "/pricing", 200);
  await fetchCheck("Compare", "/compare", 200);
  await fetchCheck("Demo booking", "/demo", 200);
  await fetchCheck("Guide pack", "/guides/ecommerce", 200);
  await fetchCheck("How it works", "/how-it-works", 200);
  await fetchCheck("Sign-in page", "/login", 200);
  await fetchCheck("Inngest webhook", "/api/inngest", [200, 405]);

  const homeRes = await fetch(`${BASE_URL}/`);
  if (homeRes.ok) {
    const html = await homeRes.text();
    if (html.includes("Launch before you list")) {
      pass("USP on homepage", "tagline visible");
    } else {
      fail("USP on homepage", "missing tagline — deploy may be stale");
    }
  }

  const inngestKey = process.env.INNGEST_EVENT_KEY?.trim();
  const inngestConfigured =
    Boolean(inngestKey && inngestKey.length > 8 && !inngestKey.includes("placeholder"));
  if (inngestConfigured) {
    pass("Inngest env (local)", "INNGEST_EVENT_KEY present — worker should process jobs on Vercel");
  } else {
    fail(
      "Inngest env (local)",
      "INNGEST_EVENT_KEY missing in .env.local — connect Vercel Marketplace Inngest + redeploy before pipeline E2E"
    );
  }

  if (!process.env.AUTH_SECRET) {
    console.log("\nSkipping authenticated pipeline checks (AUTH_SECRET not loaded).\n");
  } else {
    const user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
      select: { id: true, credits: true, brandProfile: { select: { onboardingComplete: true } } },
    });

    if (!user) {
      fail("Test account", `${TEST_EMAIL} not found`);
    } else {
      pass("Test account", TEST_EMAIL);
      const cookie = await sessionCookie(user.id, user.credits);
      if (!cookie) {
        fail("Session cookie", "could not encode");
      } else if (user.brandProfile?.onboardingComplete) {
        pass("Brand onboarding", "complete");
      } else {
        fail("Brand onboarding", "incomplete — finish /onboarding first");
      }

      if (cookie && user.credits >= 1 && process.env.SKIP_PIPELINE !== "1") {
        const res = await fetch(`${BASE_URL}/api/generate/copy`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({
            marketplace: "AMAZON_US",
            productData: {
              name: "Smoke Test Moisturiser",
              brandName: "ProductPixl Smoke",
              category: "Beauty & Personal Care > Skin Care",
              materials: "Aqua",
              keyFeatures: "Daily hydration",
              targetBuyer: "Sensitive skin",
              competitors: "Generic moisturizers",
              vibe: "clean premium",
              useCase: "Daily use",
              differentiators: "Minimal label",
              referenceImageUrls: [],
            },
          }),
        });
        const data = (await res.json()) as { productId?: string; error?: string };
        if (!res.ok || !data.productId) {
          fail("Copy pipeline enqueue", data.error ?? `HTTP ${res.status}`);
        } else {
          pass("Copy pipeline enqueue", `productId=${data.productId}`);
          let final = "";
          for (let i = 0; i < 45; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const statusRes = await fetch(`${BASE_URL}/api/products/${data.productId}/status`, {
              headers: { Cookie: cookie },
            });
            const statusData = (await statusRes.json()) as {
              listingCopy?: { status?: string; title?: string; errorMessage?: string };
            };
            final = statusData.listingCopy?.status ?? "";
            if (final === "COMPLETE") {
              pass("Copy pipeline complete", (statusData.listingCopy?.title ?? "").slice(0, 80));
              break;
            }
            if (final === "FAILED") {
              fail("Copy pipeline complete", statusData.listingCopy?.errorMessage ?? "FAILED");
              break;
            }
          }
          if (final !== "COMPLETE" && final !== "FAILED") {
            fail(
              "Copy pipeline complete",
              `timed out at ${final || "QUEUED"} — verify Inngest integration on Vercel`
            );
          }
        }
      } else if (process.env.SKIP_PIPELINE === "1") {
        console.log("(Skipping pipeline — SKIP_PIPELINE=1)");
      }
    }
  }

  await prisma.$disconnect();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log("\nFailed:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log("\nProduction smoke passed.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
