import { prisma } from "../src/lib/prisma";
import { getCheckoutReadiness } from "../src/lib/checkout";

const TEST_EMAIL = process.argv[2] ?? "alinoerie@gmail.com";

function flag(ok: boolean, label: string, detail: string) {
  console.log(`${ok ? "✓" : "✗"} ${label} — ${detail}`);
  return ok;
}

async function main() {
  console.log(`\nProductPixl E2E readiness — ${TEST_EMAIL}\n`);

  let ready = true;

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    flag(true, "Database", "connected");
  } catch (err) {
    ready = false;
    flag(false, "Database", err instanceof Error ? err.message : String(err));
  }

  // Auth
  const authOk = Boolean(process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID);
  ready = flag(authOk, "Google OAuth env", authOk ? "AUTH_SECRET + AUTH_GOOGLE_ID set" : "missing AUTH_* vars") && ready;

  // AI / storage
  const replicate = process.env.REPLICATE_API_TOKEN?.trim();
  const replicateOk = Boolean(replicate && !replicate.includes("placeholder"));
  flag(replicateOk, "Replicate", replicateOk ? "live token (real AI)" : "stub mode — demo data only");

  const cloudinaryOk = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);
  ready = flag(cloudinaryOk, "Cloudinary", cloudinaryOk ? "configured" : "missing — uploads will fail") && ready;

  // Inngest — required for generate/copy on Vercel
  const inngestKey = process.env.INNGEST_EVENT_KEY?.trim();
  const inngestOk =
    process.env.NODE_ENV === "development" ||
    Boolean(inngestKey && inngestKey.length > 8 && !inngestKey.includes("placeholder"));
  if (!inngestOk) {
    console.log(
      "  → Install: https://vercel.com/marketplace/inngest — connect productpixl, redeploy production"
    );
  }
  ready = flag(inngestOk, "Inngest jobs", inngestOk ? "configured" : "NOT configured — generate/copy stuck at Queued on Vercel") && ready;

  const { creditsFulfillmentReady, checkoutEnabled, webhookConfigured } = getCheckoutReadiness();
  if (!creditsFulfillmentReady) {
    if (!checkoutEnabled) {
      console.log("  → Stripe: set STRIPE_SECRET_KEY — see docs/STRIPE_VERCEL.md");
    } else if (!webhookConfigured) {
      console.log("  → Stripe webhook: set STRIPE_WEBHOOK_SECRET + endpoint /api/webhooks/stripe");
    }
  }
  flag(
    creditsFulfillmentReady,
    "Stripe checkout (live)",
    creditsFulfillmentReady
      ? "secret key + webhook configured"
      : checkoutEnabled
        ? "secret key set — webhook missing (purchases disabled)"
        : "not configured — purchases disabled"
  );

  // Test user
  const user = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
    include: { brandProfile: true, _count: { select: { products: true } } },
  });

  if (!user) {
    ready = false;
    flag(false, "Test account", `${TEST_EMAIL} not found — sign in once on the site first`);
  } else {
    flag(true, "Test account", `${TEST_EMAIL} exists`);
    ready = flag(user.credits >= 100, "Credits", `${user.credits.toLocaleString()} available`) && ready;
    ready =
      flag(
        user.brandProfile?.onboardingComplete === true,
        "Brand onboarding",
        user.brandProfile?.onboardingComplete ? "complete — studio unlocked" : "incomplete — finish /onboarding first"
      ) && ready;

    const stuck = await prisma.product.count({
      where: { userId: user.id, status: { in: ["QUEUED", "PROCESSING"] } },
    });
    if (stuck > 0) {
      flag(false, "Stuck projects", `${stuck} queued/processing — run: npx tsx scripts/reset-stuck-products.ts`);
    } else {
      flag(true, "Stuck projects", "none");
    }
  }

  console.log(`\n${ready ? "Ready for E2E testing." : "Fix the items above before full E2E testing."}\n`);

  if (process.env.NODE_ENV === "development") {
    console.log("Local E2E: pnpm dev (inline pipelines) or pnpm dev + pnpm inngest:dev, then open http://localhost:3001");
    console.log("Local API smoke: pnpm test:api");
  } else {
    console.log("Production smoke: SMOKE_BASE_URL=https://productpixl.vercel.app pnpm test:smoke:prod");
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
