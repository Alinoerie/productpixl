import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudioOverview } from "@/components/studio/studio-overview";
import { getActiveBrand } from "@/lib/brands";
import { primaryListingCopy } from "@/lib/listing-copy";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { Button } from "@/components/ui/button";

export default async function ContentStudioOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ firstRun?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const activeBrand = await getActiveBrand(session.user.id);
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const [products, totalProjects, user, exportReady, brandCount] = await Promise.all([
    prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { assets: { where: { imageUrl: { not: null } }, take: 1 }, listingCopies: true },
    }),
    prisma.product.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } }),
    prisma.product.count({
      where: {
        userId: session.user.id,
        listingCopies: { some: { title: { not: null } } },
        assets: { some: { imageUrl: { not: null } } },
      },
    }),
    prisma.brand.count({ where: { userId: session.user.id } }),
  ]);

  const credits = user?.credits ?? 0;

  return (
    <div className="space-y-6">
      {params.firstRun === "1" ? (
        <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/30 px-4 py-4 text-sm md:flex md:items-center md:justify-between md:gap-4">
          <p>
            <strong>Brand kit saved.</strong> Upload one product photo to generate your first gallery — credits are
            quoted before anything runs.
          </p>
          <Button asChild className="mt-3 shrink-0 md:mt-0">
            <Link href={STUDIO_ROUTES.images}>
              Start first gallery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      <StudioOverview
        userName={firstName}
        brandName={activeBrand.name}
        credits={credits}
        totalProjects={totalProjects}
        exportReady={exportReady}
        brandCount={brandCount}
        recentProjects={products.map((p) => {
          const copy = primaryListingCopy(p.listingCopies, p.marketplace);
          return {
          id: p.id,
          name: p.name,
          status: p.status,
          thumb: p.assets[0]?.imageUrl ?? null,
          hasCopy: Boolean(copy?.title),
          hasImages: p.assets.length > 0,
        };
        })}
      />
    </div>
  );
}
