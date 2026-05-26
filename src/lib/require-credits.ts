import { prisma } from "@/lib/prisma";

export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}

/** Returns user row when they have at least `min` credits; otherwise null. */
export async function requireCredits(userId: string, min = 1) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, credits: true },
  });
  if (!user || user.credits < min) return null;
  return user;
}

export function insufficientCreditsResponse() {
  return Response.json(
    {
      error: "Insufficient credits",
      code: "INSUFFICIENT_CREDITS",
      paywallUrl: "/pricing?locked=1",
    },
    { status: 402 }
  );
}
