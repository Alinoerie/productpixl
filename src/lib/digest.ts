import { prisma } from "@/lib/prisma";

export type WeeklyDigestData = {
  userId: string;
  userEmail: string;
  userName: string | null;
  weekStart: Date;
  weekEnd: Date;
  creditsUsed: number;
  assetsGenerated: number;
  listingsCompleted: number;
  failedJobs: FailedJobInfo[];
};

export type FailedJobInfo = {
  productId: string;
  productName: string;
  pipelineType: string;
  failedAt: Date;
  errorMessage: string | null;
};

/**
 * Generate a weekly digest for a user.
 * Queries products created/updated in the past 7 days.
 */
export async function generateWeeklyDigest(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<WeeklyDigestData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) return null;

  // Products updated (asset/listings completed) within the week
  const productsThisWeek = await prisma.product.findMany({
    where: {
      userId,
      updatedAt: { gte: weekStart, lte: weekEnd },
    },
    select: {
      id: true,
      name: true,
      pipelineType: true,
      status: true,
      updatedAt: true,
      assets: {
        select: { id: true, status: true },
      },
      listingCopies: {
        select: { id: true, status: true },
      },
    },
  });

  const assetsGenerated = productsThisWeek.reduce(
    (sum, p) => sum + p.assets.filter((a) => a.status === "COMPLETE" || a.status === "READY").length,
    0
  );

  const listingsCompleted = productsThisWeek.reduce(
    (sum, p) => sum + p.listingCopies.filter((lc) => lc.status === "COMPLETE" || lc.status === "READY").length,
    0
  );

  const failedJobs: FailedJobInfo[] = productsThisWeek
    .filter((p) => p.status === "FAILED" || p.assets.some((a) => a.status === "FAILED") || p.listingCopies.some((lc) => lc.status === "FAILED"))
    .map((p) => ({
      productId: p.id,
      productName: p.name,
      pipelineType: p.pipelineType,
      failedAt: p.updatedAt,
      errorMessage: null,
    }));

  // Credits used: sum of credit transactions tracked via orders in the period
  // We approximate via orders placed this week
  const ordersThisWeek = await prisma.order.findMany({
    where: {
      userId,
      createdAt: { gte: weekStart, lte: weekEnd },
      status: { in: ["COMPLETED", "PAID", "SUCCESS"] },
    },
  });

  const creditsUsed = ordersThisWeek.reduce((sum, o) => sum + o.credits, 0);

  return {
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    weekStart,
    weekEnd,
    creditsUsed,
    assetsGenerated,
    listingsCompleted,
    failedJobs,
  };
}

/** Check if user has weekly digest enabled in notification prefs */
export async function isWeeklyDigestEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationPrefs: true },
  });

  if (!user?.notificationPrefs) return false;
  const prefs = user.notificationPrefs as { weeklyDigest?: boolean };
  return Boolean(prefs.weeklyDigest);
}
