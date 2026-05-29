import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserCredits } from "@/lib/require-credits";
import {
  quoteCopyRun,
  quoteImageRun,
  quoteRegenerateModule,
  type CreditQuote,
} from "@/lib/credit-pricing";
import type { ProductIntakeData } from "@/lib/product-intake";
import type { ListingModuleId } from "@/pipelines/modules";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    kind: "image" | "copy" | "regenerate";
    marketplace?: string;
    includePackaging?: boolean;
    selectedModules?: ListingModuleId[];
    intake?: Partial<ProductIntakeData>;
    moduleId?: ListingModuleId;
  };

  let quote: CreditQuote;
  switch (body.kind) {
    case "image":
      quote = quoteImageRun({
        includePackaging: Boolean(body.includePackaging),
        selectedModules: body.selectedModules,
        marketplace: body.marketplace ?? "AMAZON_US",
        intake: body.intake ?? {},
      });
      break;
    case "copy":
      quote = quoteCopyRun({
        marketplace: body.marketplace ?? "AMAZON_US",
        intake: body.intake ?? {},
      });
      break;
    case "regenerate":
      if (!body.moduleId) {
        return NextResponse.json({ error: "moduleId required" }, { status: 400 });
      }
      quote = quoteRegenerateModule(
        body.moduleId,
        body.marketplace ?? "AMAZON_US",
        body.intake ?? {}
      );
      break;
    default:
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const balance = await getUserCredits(session.user.id);
  return NextResponse.json({
    ...quote,
    balance,
    canAfford: balance >= quote.total,
  });
}
