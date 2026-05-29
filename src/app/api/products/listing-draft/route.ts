import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const draftSchema = z.object({
  name: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  bullets: z.array(z.string()).min(1).max(10),
  description: z.string().max(10000).optional().nullable(),
  backendKeywords: z.string().max(500).optional().nullable(),
  marketplace: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof draftSchema>;
  try {
    body = draftSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid listing draft" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      userId: session.user.id,
      name: body.name,
      inputImageUrl: "",
      pipelineType: "COPY",
      marketplace: body.marketplace ?? "AMAZON_US",
      status: "COMPLETE",
    },
  });

  await prisma.listingCopy.create({
    data: {
      productId: product.id,
      marketplace: body.marketplace ?? "AMAZON_US",
      status: "COMPLETE",
      title: body.title,
      bullets: body.bullets,
      description: body.description ?? null,
      backendKeywords: body.backendKeywords ?? null,
    },
  });

  return NextResponse.json({ productId: product.id });
}
