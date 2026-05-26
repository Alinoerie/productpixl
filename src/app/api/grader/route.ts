import { NextRequest, NextResponse } from "next/server";
import { gradeListing } from "@/lib/listing-grader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      title?: string;
      bullets?: string[];
      description?: string;
      backendKeywords?: string;
      productId?: string;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const result = gradeListing({
      title: body.title,
      bullets: body.bullets ?? [],
      description: body.description,
      backendKeywords: body.backendKeywords,
    });

    if (body.productId) {
      const session = await auth();
      if (session?.user?.id) {
        const product = await prisma.product.findFirst({
          where: { id: body.productId, userId: session.user.id },
          include: { listingCopy: true },
        });
        if (product?.listingCopy) {
          await prisma.listingCopy.update({
            where: { productId: body.productId },
            data: {
              grade: result.grade,
              gradeScore: result.score,
              gradedAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[grader]", err);
    return NextResponse.json({ error: "Grading failed" }, { status: 500 });
  }
}
