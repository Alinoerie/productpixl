import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateListingCopySection, type CopySectionId } from "@/pipelines/copy-gen";
import { quoteCopySection } from "@/lib/credit-pricing";
import type { ProductIntakeData } from "@/lib/product-intake";
import { insufficientCreditsResponse, requireCredits, getUserCredits } from "@/lib/require-credits";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    section,
    bulletIndex,
    marketplace = "AMAZON_US",
    productData,
    existingCopy,
  } = body as {
    section: CopySectionId;
    bulletIndex?: number;
    marketplace?: string;
    productData: ProductIntakeData;
    existingCopy?: {
      title?: string;
      bullets?: string[];
      description?: string;
      backendKeywords?: string;
    };
  };

  if (!section || !productData?.name || !productData?.category) {
    return NextResponse.json({ error: "Section, product name, and category are required" }, { status: 400 });
  }

  const quote = quoteCopySection(marketplace);
  const user = await requireCredits(session.user.id, quote.total);
  if (!user) {
    const available = await getUserCredits(session.user.id);
    return insufficientCreditsResponse(quote.total, available);
  }

  try {
    const result = await generateListingCopySection({
      section,
      bulletIndex,
      productName: productData.name,
      brandName: productData.brandName,
      category: productData.category,
      marketplace,
      existing: existingCopy ?? {},
      materials: productData.materials,
      keyFeatures: productData.keyFeatures,
      targetBuyer: productData.targetBuyer,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: quote.total } },
    });

    return NextResponse.json({
      success: true,
      section,
      result,
      creditsCharged: quote.total,
    });
  } catch (err) {
    console.error("[generate/copy/section]", err);
    return NextResponse.json({ error: "Section regeneration failed" }, { status: 500 });
  }
}
