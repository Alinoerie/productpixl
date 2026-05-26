/**
 * End-to-end API smoke test — lib layer + authenticated HTTP routes.
 * Usage: bash -c 'set -a && . ./.env.local && set +a && pnpm dlx tsx scripts/api-smoke-test.ts'
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { encode } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { analyzeProductImage, generateBrandStory } from "../src/lib/ai";
import { isStubMode } from "../src/lib/utils";
import { DEFAULT_BRAND_PROFILE } from "../src/lib/brand-profile";
import { runCategoryResearch } from "../src/pipelines/tavily";
import { buildListingPrompt } from "../src/pipelines/prompt-builder";
import { getModulesForRun } from "../src/pipelines/modules";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
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
}

loadEnvLocal();

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://localhost:3002";
const prisma = new PrismaClient();

type Result = { name: string; ok: boolean; detail: string; ms?: number };

const results: Result[] = [];

function pass(name: string, detail: string, ms?: number) {
  results.push({ name, ok: true, detail, ms });
  console.log(`✓ ${name} — ${detail}${ms != null ? ` (${ms}ms)` : ""}`);
}

function fail(name: string, detail: string, ms?: number) {
  results.push({ name, ok: false, detail, ms });
  console.error(`✗ ${name} — ${detail}${ms != null ? ` (${ms}ms)` : ""}`);
}

async function timed<T>(name: string, fn: () => Promise<T>): Promise<T | null> {
  const start = Date.now();
  try {
    const value = await fn();
    pass(name, "ok", Date.now() - start);
    return value;
  } catch (err) {
    fail(name, err instanceof Error ? err.message : String(err), Date.now() - start);
    return null;
  }
}

async function sessionCookie(userId: string, credits: number): Promise<string> {
  const token = await encode({
    token: { sub: userId, id: userId, credits },
    secret: process.env.AUTH_SECRET!,
    salt: "authjs.session-token",
  });
  return `authjs.session-token=${token}`;
}

async function api(
  name: string,
  path: string,
  cookie: string,
  init?: RequestInit & { expectStatus?: number }
): Promise<Record<string, unknown> | null> {
  const start = Date.now();
  const expectStatus = init?.expectStatus ?? 200;
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
        ...(init?.headers ?? {}),
      },
    });
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = { raw: text.slice(0, 200) };
    }
    if (res.status !== expectStatus) {
      fail(name, `HTTP ${res.status} expected ${expectStatus}: ${JSON.stringify(data).slice(0, 300)}`, Date.now() - start);
      return null;
    }
    pass(name, `HTTP ${res.status}`, Date.now() - start);
    return data;
  } catch (err) {
    fail(name, err instanceof Error ? err.message : String(err), Date.now() - start);
    return null;
  }
}

async function main() {
  console.log(`\nProductPixl API smoke test → ${BASE_URL}\n`);

  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    console.error("No users in database — sign in once via Google OAuth first.");
    process.exit(1);
  }

  const product = await prisma.product.findFirst({
    where: { userId: user.id, inputImageUrl: { not: "" } },
    orderBy: { createdAt: "desc" },
  });

  const imageUrl =
    product?.inputImageUrl ??
    "https://res.cloudinary.com/diwmwicr8/image/upload/v1779813471/productpixl/cmplgj5gf0000frp959ltv695/uploads/bh3gx6oxvfvxy4e9qnlf.jpg";

  console.log(`User: ${user.email} (${user.id})`);
  console.log(`Stub mode: ${isStubMode()}`);
  console.log(`Test image: ${imageUrl.slice(0, 80)}…\n`);

  // --- Unauthenticated guards ---
  await api("HTTP GET /api/brand-profile (401)", "/api/brand-profile", "", { expectStatus: 401 });
  await api("HTTP POST /api/analyze (401)", "/api/analyze", "", {
    method: "POST",
    body: JSON.stringify({ imageUrl }),
    expectStatus: 401,
  });

  // --- Prepare user for real studio tests ---
  const brandStory =
    "Copper Horizon Skincare creates gentle, dermatologist-trusted moisturizers for sensitive skin shoppers who want premium packaging without clinical coldness. Every listing should feel warm, credible, and conversion-focused.";
  await prisma.brandProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      companyName: "Copper Horizon Labs",
      companyDescription: "Premium sensitive-skin personal care for marketplace shoppers.",
      targetAudience: "Sensitive-skin households on Amazon and Bol.com",
      displayName: "Copper Horizon",
      tone: "premium, warm, trustworthy, no hype",
      brandStory,
      onboardingComplete: true,
    },
    update: {
      companyName: "Copper Horizon Labs",
      companyDescription: "Premium sensitive-skin personal care for marketplace shoppers.",
      targetAudience: "Sensitive-skin households on Amazon and Bol.com",
      displayName: "Copper Horizon",
      tone: "premium, warm, trustworthy, no hype",
      brandStory,
      onboardingComplete: true,
    },
  });
  await prisma.user.update({ where: { id: user.id }, data: { credits: 10 } });
  pass("DB setup", "brand profile + 10 credits for smoke test user");

  const cookie = await sessionCookie(user.id, 10);

  // --- Lib layer (real Replicate when token set) ---
  const analysis = await timed("Lib analyzeProductImage", () => analyzeProductImage(imageUrl));
  if (analysis) {
    console.log(`  → product: ${analysis.productName} | brand: ${analysis.brandName} | category: ${analysis.amazonCategory}`);
  }

  await timed("Lib generateBrandStory", () =>
    generateBrandStory({
      ...DEFAULT_BRAND_PROFILE,
      companyName: "Copper Horizon Labs",
      displayName: "Copper Horizon",
      targetAudience: "Sensitive-skin shoppers",
      tone: "premium, warm, trustworthy",
    })
  );

  const research = await timed("Lib runCategoryResearch", () =>
    runCategoryResearch(analysis?.productName ?? "Moisturiser", analysis?.amazonCategory ?? "Beauty")
  );

  if (analysis && research) {
    const mod = getModulesForRun(false)[0];
    const prompt = buildListingPrompt(
      mod.id,
      analysis,
      {
        name: analysis.productName,
        brandName: "Copper Horizon",
        category: analysis.amazonCategory,
        vibe: analysis.mood,
        useCase: analysis.useCase,
        differentiators: analysis.differentiators,
        keyFeatures: analysis.keyObservations,
        targetBuyer: analysis.suggestedTargetBuyer,
        referenceImageUrls: [],
      },
      research,
      { brandProfile: { ...DEFAULT_BRAND_PROFILE, displayName: "Copper Horizon", brandStory, onboardingComplete: true }, marketplace: "AMAZON_US" }
    );
    if (prompt.includes("Copper Horizon") && prompt.includes("Brand & company context")) {
      pass("Lib buildListingPrompt", "includes brand + product context blocks");
    } else {
      fail("Lib buildListingPrompt", "missing expected brand/product context in prompt");
    }
  }

  // --- Authenticated HTTP ---
  const profile = await api("HTTP GET /api/brand-profile", "/api/brand-profile", cookie);
  if (profile?.profile && typeof profile.profile === "object") {
    const p = profile.profile as { onboardingComplete?: boolean; brandStory?: string };
    if (p.onboardingComplete && p.brandStory) pass("Brand profile payload", "onboardingComplete + brandStory present");
    else fail("Brand profile payload", "missing onboardingComplete or brandStory");
  }

  const analyzeRes = await api("HTTP POST /api/analyze", "/api/analyze", cookie, {
    method: "POST",
    body: JSON.stringify({ imageUrl }),
  });
  if (analyzeRes?.analysis && analyzeRes.stubMode === false) {
    pass("Analyze API live mode", "stubMode=false");
  } else if (analyzeRes?.analysis && analyzeRes.stubMode === true) {
    pass("Analyze API stub mode", "REPLICATE token missing/placeholder — demo data returned");
  }

  const storyRes = await api("HTTP POST /api/brand-profile/generate-story", "/api/brand-profile/generate-story", cookie, {
    method: "POST",
    body: JSON.stringify({
      companyName: "Copper Horizon Labs",
      displayName: "Copper Horizon",
      targetAudience: "Sensitive-skin shoppers",
      tone: "premium, warm, trustworthy",
    }),
  });
  if (storyRes?.brandStory && String(storyRes.brandStory).length > 40) {
    pass("Brand story API", `${String(storyRes.brandStory).length} chars returned`);
  } else if (storyRes) {
    fail("Brand story API", "empty or short brandStory");
  }

  const productData = {
    name: analysis?.productName ?? "Test Moisturiser",
    brandName: "Copper Horizon",
    category: analysis?.amazonCategory ?? "Beauty & Personal Care > Skin Care",
    dimensions: analysis?.dimensions ?? "150ml",
    materials: analysis?.materials ?? "Aqua",
    colors: analysis?.colors ?? "White",
    keyFeatures: analysis?.keyObservations ?? "Hydrating daily moisturizer",
    targetBuyer: analysis?.suggestedTargetBuyer ?? "Sensitive skin shoppers",
    competitors: "Generic drugstore moisturizers",
    vibe: analysis?.mood ?? "clean spa premium",
    useCase: analysis?.useCase ?? "Daily hydration",
    differentiators: analysis?.differentiators ?? "Minimal label, premium bottle",
    referenceImageUrls: [] as string[],
  };

  const promptsRes = await api("HTTP POST /api/generate/images/prompts", "/api/generate/images/prompts", cookie, {
    method: "POST",
    body: JSON.stringify({
      inputImageUrl: imageUrl,
      includePackaging: false,
      marketplace: "AMAZON_US",
      productData,
      analysis: analyzeRes?.analysis ?? analysis,
    }),
  });
  const prompts = promptsRes?.prompts as { moduleId: string; prompt: string }[] | undefined;
  if (prompts?.length) {
    const hasBrand = prompts.every((p) => p.prompt.includes("Copper Horizon") || p.prompt.includes("Brand & company context"));
    if (hasBrand) pass("Prompt plan API", `${prompts.length} prompts with brand context`);
    else fail("Prompt plan API", "prompts missing brand context");
  }

  // Copy pipeline (1 credit) — optional if SKIP_PIPELINE=1
  if (process.env.SKIP_PIPELINE !== "1") {
    const copyRes = await api("HTTP POST /api/generate/copy", "/api/generate/copy", cookie, {
      method: "POST",
      body: JSON.stringify({
        inputImageUrl: imageUrl,
        marketplace: "AMAZON_US",
        productData,
      }),
    });
    const productId = copyRes?.productId as string | undefined;
    if (productId) {
      pass("Copy pipeline queued", `productId=${productId}`);
      let finalStatus = "";
      for (let i = 0; i < 45; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await api(
          i === 0 ? "HTTP GET /api/products/[id]/status (poll)" : `HTTP poll ${i + 1}`,
          `/api/products/${productId}/status`,
          cookie
        );
        const lc = statusRes?.listingCopy as { status?: string; title?: string; errorMessage?: string } | undefined;
        finalStatus = lc?.status ?? statusRes?.status?.toString() ?? "";
        if (finalStatus === "COMPLETE") {
          pass("Copy pipeline complete", `title: ${(lc?.title ?? "").slice(0, 80)}`);
          break;
        }
        if (finalStatus === "FAILED") {
          fail("Copy pipeline complete", lc?.errorMessage ?? "FAILED");
          break;
        }
      }
      if (finalStatus !== "COMPLETE" && finalStatus !== "FAILED") {
        fail("Copy pipeline complete", `timed out (last status: ${finalStatus || "unknown"}) — is Inngest dev running?`);
      }
    }
  } else {
    console.log("(Skipping copy pipeline — SKIP_PIPELINE=1)");
  }

  await prisma.$disconnect();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log("\nFailed:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log("\nAll API smoke checks passed.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
