import { prisma } from "./prisma";
import { isBrandOnboardingComplete } from "./brand-profile";
import { hasPaidCredits } from "./credits-access";
import { STUDIO_ROUTES } from "./studio-routes";

export type JourneyStep = {
  step: string;
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  variant?: "default" | "accent" | "muted";
};

export async function getStudioPreflight(userId: string) {
  const [onboardingComplete, user] = await Promise.all([
    isBrandOnboardingComplete(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }),
  ]);
  return {
    onboardingComplete,
    credits: user?.credits ?? 0,
  };
}

export function getOnboardingJourney(): JourneyStep {
  return {
    step: "Step 1 of 3",
    title: "Tell us about your brand",
    body: "Four quick steps lock in colors, tone, and rules. Every image and copy run uses your active brand automatically.",
    actionHref: "#brand-form",
    actionLabel: "Start below",
    secondaryHref: "/how-it-works",
    secondaryLabel: "See the full flow",
    variant: "accent",
  };
}

export function getGenerateJourney(opts: {
  onboardingComplete: boolean;
  credits: number;
  linkedProductId?: string | null;
}): JourneyStep {
  if (!opts.onboardingComplete) {
    return {
      step: "Before you generate",
      title: "Finish brand setup first",
      body: "Image studio uses your brand kit for consistent colors and tone across every module.",
      actionHref: "/onboarding",
      actionLabel: "Complete brand setup",
      secondaryHref: STUDIO_ROUTES.brandProfile,
      secondaryLabel: "Edit brand kit",
      variant: "accent",
    };
  }
  if (!hasPaidCredits(opts.credits)) {
    return {
      step: "Credits needed",
      title: "Top up to run the image studio",
      body: "Each gallery run uses variable credits based on marketplace and modules. Buy a pack, then return here to upload your photo.",
      actionHref: "/pricing?locked=1",
      actionLabel: "View pricing",
      secondaryHref: "/account",
      secondaryLabel: "Account & balance",
      variant: "muted",
    };
  }
  if (opts.linkedProductId) {
    return {
      step: "Resume project",
      title: "Review your product, then run",
      body: "We pre-filled this project from your saved SKU. Confirm intake details, review the prompt plan, and start generation.",
      actionHref: "#studio-steps",
      actionLabel: "Continue below",
      secondaryHref: `/products/${opts.linkedProductId}`,
      secondaryLabel: "Open project page",
    };
  }
  return {
    step: "Step 2 of 3",
    title: "Review your plan, then generate",
    body: "We build prompts from your photo and brand kit. Expand only if you want to edit before spending credits.",
    actionHref: "#studio-steps",
    actionLabel: "Continue below",
    secondaryHref: STUDIO_ROUTES.copy,
    secondaryLabel: "Copy only — skip images",
    variant: "accent",
  };
}

export function getCopyJourney(opts: {
  onboardingComplete: boolean;
  credits: number;
  linkedProductId?: string | null;
}): JourneyStep {
  if (!opts.onboardingComplete) {
    return {
      step: "Before you write copy",
      title: "Finish brand setup first",
      body: "Listing copy pulls voice and claims from your brand kit so bullets stay on-brand.",
      actionHref: "/onboarding",
      actionLabel: "Complete brand setup",
      variant: "accent",
    };
  }
  if (!hasPaidCredits(opts.credits)) {
    return {
      step: "Credits needed",
      title: "Top up to run copy studio",
      body: "Title, bullets, and backend keywords cost credits per run. Purchase a pack, then return to paste or upload product details.",
      actionHref: "/pricing?locked=1",
      actionLabel: "View pricing",
      secondaryHref: "/grader",
      secondaryLabel: "Free listing grader",
      variant: "muted",
    };
  }
  if (opts.linkedProductId) {
    return {
      step: "Linked project",
      title: "Generate copy for this SKU",
      body: "Product details are loaded from your project. Run copy generation, edit in place, then grade or export from the project page.",
      actionHref: "#studio-steps",
      actionLabel: "Continue below",
      secondaryHref: `/products/${opts.linkedProductId}`,
      secondaryLabel: "Back to project",
    };
  }
  return {
    step: "Copy-only run",
    title: "Add product details, then generate",
    body: "Upload a photo or paste what you know — we write marketplace-ready title, bullets, and keywords. Saves as a project you can pair with images later.",
    actionHref: "#studio-steps",
    actionLabel: "Start details step",
    secondaryHref: STUDIO_ROUTES.images,
    secondaryLabel: "Image studio instead",
    variant: "accent",
  };
}

export function getProjectsJourney(total: number): JourneyStep {
  if (total === 0) {
    return {
      step: "No projects yet",
      title: "Your first run creates a project here",
      body: "Image studio and copy studio both save work as projects — return anytime to export, edit modules, or add the missing half of your listing.",
      actionHref: STUDIO_ROUTES.images,
      actionLabel: "Open image studio",
      secondaryHref: STUDIO_ROUTES.copy,
      secondaryLabel: "Generate listing copy",
      variant: "accent",
    };
  }
  return {
    step: "Pick up where you left off",
    title: "Open a project to export or finish",
    body: "Filter by export-ready, failed, or missing copy. Each project page shows the next action — images, copy, grade, or download.",
    actionHref: `${STUDIO_ROUTES.projects}?ready=export`,
    actionLabel: "Export-ready projects",
    secondaryHref: STUDIO_ROUTES.images,
    secondaryLabel: "New image run",
  };
}

export function getBrandJourney(onboardingComplete: boolean): JourneyStep {
  if (!onboardingComplete) {
    return {
      step: "Step 1",
      title: "Finish your listing brand kit",
      body: "Add your brand name, colors, and copy tone below — or use the onboarding wizard if you prefer a guided flow.",
      actionHref: "/onboarding",
      actionLabel: "Guided setup",
      variant: "accent",
    };
  }
  return {
    step: "Applies on next run",
    title: "Your active brand is locked into every studio",
    body: "Changes here affect new generations only. Open image or copy studio when you're ready to ship another SKU.",
    actionHref: STUDIO_ROUTES.images,
    actionLabel: "Image studio",
    secondaryHref: STUDIO_ROUTES.copy,
    secondaryLabel: "Copy studio",
  };
}

export function getAccountJourney(credits: number): JourneyStep {
  if (!hasPaidCredits(credits)) {
    return {
      step: "Out of credits",
      title: "Purchase a pack to unlock studios",
      body: "Account, brand profile, projects, and the free grader stay available. Image and copy studios need at least one credit.",
      actionHref: "/pricing?locked=1",
      actionLabel: "View credit packs",
      secondaryHref: "/grader",
      secondaryLabel: "Free grader",
      variant: "muted",
    };
  }
  if (credits < 5) {
    return {
      step: "Running low",
      title: "Top up before your next catalog push",
      body: `${credits} credit${credits === 1 ? "" : "s"} left — gallery runs can use several credits depending on marketplace and modules.`,
      actionHref: "/pricing",
      actionLabel: "Buy credits",
      secondaryHref: STUDIO_ROUTES.images,
      secondaryLabel: "Continue with balance",
      variant: "muted",
    };
  }
  return {
    step: "You're set",
    title: "Start or resume work in the studio",
    body: "Check recent orders below, then open image studio for a new SKU or projects to finish an existing listing.",
    actionHref: STUDIO_ROUTES.images,
    actionLabel: "New image run",
    secondaryHref: STUDIO_ROUTES.projects,
    secondaryLabel: "All projects",
  };
}

export function getProductJourney(opts: {
  productId: string;
  status: string;
  completedImages: number;
  hasCopy: boolean;
}): JourneyStep {
  const { productId, status, completedImages, hasCopy } = opts;

  if (status === "QUEUED" || status === "PROCESSING") {
    return {
      step: "In progress",
      title: "Generation is running",
      body: "This page updates automatically. When modules finish, spot-edit any frame or move on to listing copy.",
      actionHref: "#gallery",
      actionLabel: "Watch gallery",
      variant: "muted",
    };
  }

  if (status === "FAILED") {
    return {
      step: "Needs attention",
      title: "Retry the image run",
      body: "Something failed during generation. Open image studio with this project loaded, or regenerate individual modules below.",
      actionHref: `${STUDIO_ROUTES.images}?productId=${productId}`,
      actionLabel: "Retry in image studio",
      variant: "accent",
    };
  }

  if (completedImages > 0 && !hasCopy) {
    return {
      step: "Next step",
      title: "Add listing copy for this SKU",
      body: "Gallery images are ready. Generate RUFUS-ready title, bullets, and backend keywords tied to this project.",
      actionHref: `${STUDIO_ROUTES.copy}?productId=${productId}`,
      actionLabel: "Generate copy",
      secondaryHref: "#gallery",
      secondaryLabel: "Review images",
      variant: "accent",
    };
  }

  if (hasCopy && completedImages === 0) {
    return {
      step: "Next step",
      title: "Add gallery images",
      body: "Copy is saved. Run image studio with this product loaded to build hero, lifestyle, and detail shots.",
      actionHref: `${STUDIO_ROUTES.images}?productId=${productId}`,
      actionLabel: "Run image studio",
      secondaryHref: "#listing",
      secondaryLabel: "Review copy",
      variant: "accent",
    };
  }

  if (hasCopy && completedImages > 0) {
    return {
      step: "Export ready",
      title: "Download assets or grade your listing",
      body: "Images and copy are on this page. Export the gallery ZIP, copy fields to Seller Central, or run the grader for a score.",
      actionHref: "#export",
      actionLabel: "Jump to export",
      secondaryHref: STUDIO_ROUTES.images,
      secondaryLabel: "New SKU",
    };
  }

  return {
    step: "Getting started",
    title: "Run image studio for this project",
    body: "Upload flow creates modules here. You can add copy afterward from the same project page.",
    actionHref: `${STUDIO_ROUTES.images}?productId=${productId}`,
    actionLabel: "Open image studio",
    variant: "accent",
  };
}
