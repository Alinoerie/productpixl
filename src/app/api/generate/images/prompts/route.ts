import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeProductImage } from "@/lib/ai";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { getModulesForRun } from "@/pipelines/modules";
import { buildListingPrompt } from "@/pipelines/prompt-builder";
import { runCategoryResearch } from "@/pipelines/tavily";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    inputImageUrl?: string;
    includePackaging?: boolean;
    marketplace?: string;
    productData?: {
      name: string;
      brandName: string;
      category: string;
      dimensions?: string;
      materials?: string;
      colors?: string;
      keyFeatures?: string;
      targetBuyer?: string;
      competitors?: string;
    };
  };

  if (!body.inputImageUrl || !body.productData?.name || !body.productData?.category) {
    return NextResponse.json(
      { error: "inputImageUrl, productData.name, and productData.category are required" },
      { status: 400 }
    );
  }

  const [analysis, research, brandProfile] = await Promise.all([
    analyzeProductImage(body.inputImageUrl),
    runCategoryResearch(body.productData.name, body.productData.category),
    getBrandProfileForUser(session.user.id),
  ]);

  const modules = getModulesForRun(Boolean(body.includePackaging));
  const prompts = modules.map((mod) => ({
    moduleId: mod.id,
    label: mod.label,
    resolution: mod.resolution,
    prompt: buildListingPrompt(mod.id, analysis, body.productData!, research, {
      brandProfile,
      marketplace: body.marketplace ?? "AMAZON_US",
    }),
  }));

  return NextResponse.json({
    analysis,
    research,
    prompts,
  });
}
