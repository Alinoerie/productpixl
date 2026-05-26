import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  title: z.string().min(1).max(500),
  bullets: z.array(z.string()).min(1).max(10),
  description: z.string().max(10000).optional().nullable(),
  backendKeywords: z.string().max(500).optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    include: { listingCopy: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!product.listingCopy) {
    return NextResponse.json({ error: "No listing copy on this project" }, { status: 404 });
  }

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid listing copy payload" }, { status: 400 });
  }

  const listingCopy = await prisma.listingCopy.update({
    where: { productId: id },
    data: {
      title: body.title,
      bullets: body.bullets,
      description: body.description ?? null,
      backendKeywords: body.backendKeywords ?? null,
    },
  });

  return NextResponse.json({ listingCopy });
}
