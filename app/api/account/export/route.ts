import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      brands: true,
      products: {
        include: {
          assets: true,
          listingCopies: true,
        },
      },
      orders: true,
      brandProfile: true,
      savedPlaybooks: true,
      playbookRuns: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      credits: user.credits,
      planTier: user.planTier,
      createdAt: user.createdAt.toISOString(),
      notificationPrefs: user.notificationPrefs,
    },
    brandProfile: user.brandProfile,
    brands: user.brands.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      logoUrl: b.logoUrl,
      amazonUrl: b.amazonUrl,
      isDefault: b.isDefault,
      language: b.language,
      tagline: b.tagline,
      tone: b.tone,
      targetAudience: b.targetAudience,
      brandValues: b.brandValues,
      brandAesthetic: b.brandAesthetic,
      primaryColor: b.primaryColor,
      secondaryColor: b.secondaryColor,
      companyName: b.companyName,
      companyDescription: b.companyDescription,
      guidelines: b.guidelines,
      brandStory: b.brandStory,
      onboardingComplete: b.onboardingComplete,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
    products: user.products.map((p) => ({
      id: p.id,
      name: p.name,
      inputImageUrl: p.inputImageUrl,
      pipelineType: p.pipelineType,
      marketplace: p.marketplace,
      dimensions: p.dimensions,
      weight: p.weight,
      materials: p.materials,
      colors: p.colors,
      keyFeatures: p.keyFeatures,
      targetBuyer: p.targetBuyer,
      competitors: p.competitors,
      brandGuidelines: p.brandGuidelines,
      amazonCategory: p.amazonCategory,
      brandRegistered: p.brandRegistered,
      vibe: p.vibe,
      useCase: p.useCase,
      differentiators: p.differentiators,
      status: p.status,
      playbookSlug: p.playbookSlug,
      templateSlug: p.templateSlug,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      assets: p.assets.map((a) => ({
        id: a.id,
        moduleId: a.moduleId,
        pipelineType: a.pipelineType,
        imageUrl: a.imageUrl,
        videoUrl: a.videoUrl,
        targetWidth: a.targetWidth,
        targetHeight: a.targetHeight,
        status: a.status,
        qaScore: a.qaScore,
        errorMessage: a.errorMessage,
        altText: a.altText,
        createdAt: a.createdAt.toISOString(),
      })),
      listingCopies: p.listingCopies.map((lc) => ({
        id: lc.id,
        marketplace: lc.marketplace,
        title: lc.title,
        bullets: lc.bullets,
        description: lc.description,
        backendKeywords: lc.backendKeywords,
        status: lc.status,
        grade: lc.grade,
        gradeScore: lc.gradeScore,
        gradedAt: lc.gradedAt?.toISOString() ?? null,
        createdAt: lc.createdAt.toISOString(),
      })),
    })),
    orders: user.orders.map((o) => ({
      id: o.id,
      stripeSessionId: o.stripeSessionId,
      stripePaymentId: o.stripePaymentId,
      package: o.package,
      credits: o.credits,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
    savedPlaybooks: user.savedPlaybooks.map((sp) => ({
      id: sp.id,
      playbookSlug: sp.playbookSlug,
      name: sp.name,
      config: sp.config,
      createdAt: sp.createdAt.toISOString(),
    })),
    playbookRuns: user.playbookRuns.map((pr) => ({
      id: pr.id,
      playbookSlug: pr.playbookSlug,
      name: pr.name,
      status: pr.status,
      totalCredits: pr.totalCredits,
      completedCount: pr.completedCount,
      config: pr.config,
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
    })),
  };

  return NextResponse.json(exportData);
}
