import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveBrandId, listBrandsForUser, SOFT_BRAND_LIMIT } from "@/lib/brands";
import { BrandActivateButton } from "@/components/brand/brand-activate-button";
import { BrandCreateForm } from "@/components/brand/brand-create-form";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { STUDIO_ROUTES, projectsHref } from "@/lib/studio-routes";

type BrandStats = {
  total: number;
  complete: number;
  processing: number;
  queued: number;
  failed: number;
  avgGradeScore: number | null;
};

export default async function BrandsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [brands, activeBrandId] = await Promise.all([
    listBrandsForUser(session.user.id),
    getActiveBrandId(session.user.id),
  ]);

  // Fetch product count breakdown by brand + status
  const productStatusCounts = await prisma.product.groupBy({
    by: ["brandId", "status"],
    where: { userId: session.user.id },
    _count: { id: true },
  });

  // Build a map: brandId -> StatusBreakdown
  const breakdownByBrand = new Map<string, { total: number; complete: number; processing: number; queued: number; failed: number }>();

  for (const row of productStatusCounts) {
    const brandId = row.brandId ?? "none";
    if (!breakdownByBrand.has(brandId)) {
      breakdownByBrand.set(brandId, { total: 0, complete: 0, processing: 0, queued: 0, failed: 0 });
    }
    const b = breakdownByBrand.get(brandId)!;
    const count = row._count.id;
    b.total += count;
    switch (row.status) {
      case "COMPLETE":
        b.complete = count;
        break;
      case "PROCESSING":
        b.processing = count;
        break;
      case "QUEUED":
        b.queued = count;
        break;
      case "FAILED":
        b.failed = count;
        break;
    }
  }

  // Fetch average grader scores per brand
  const brandGradeScores = await prisma.listingCopy.groupBy({
    by: ["productId"],
    where: {
      product: { userId: session.user.id },
      gradeScore: { not: null },
    },
    _avg: { gradeScore: true },
  });

  // Map productId -> avg gradeScore
  const productGradeScore = new Map<string, number>();
  for (const row of brandGradeScores) {
    if (row._avg.gradeScore != null) {
      productGradeScore.set(row.productId, row._avg.gradeScore);
    }
  }

  // Aggregate avg grade score per brand
  const brandGradeTotals = new Map<string, { sum: number; count: number }>();
  for (const brand of brands) {
    brandGradeTotals.set(brand.id, { sum: 0, count: 0 });
  }
  const allBrandProducts = await prisma.product.findMany({
    where: { userId: session.user.id, brandId: { in: brands.map((b) => b.id) } },
    select: { id: true, brandId: true },
  });
  for (const product of allBrandProducts) {
    const score = productGradeScore.get(product.id);
    if (score != null && product.brandId) {
      const totals = brandGradeTotals.get(product.brandId)!;
      totals.sum += score;
      totals.count += 1;
    }
  }

  function getBrandStats(brandId: string): BrandStats {
    const breakdown = breakdownByBrand.get(brandId) ?? { total: 0, complete: 0, processing: 0, queued: 0, failed: 0 };
    const totals = brandGradeTotals.get(brandId) ?? { sum: 0, count: 0 };
    return {
      ...breakdown,
      avgGradeScore: totals.count > 0 ? Math.round(totals.sum / totals.count) : null,
    };
  }

  function gradeLabel(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  return (
    <StudioPageShell
      eyebrow="Brand"
      title="All brands"
      description="One listing brand kit per catalog. The active brand in the sidebar drives colors, copy tone, and new product defaults."
      headerActions={
        brands.length < SOFT_BRAND_LIMIT ? (
          <Button asChild size="sm">
            <Link href="/brands/new">New brand</Link>
          </Button>
        ) : (
          <span className="text-xs text-[var(--muted-fg)]">Soft limit: {SOFT_BRAND_LIMIT} brands</span>
        )
      }
      guide={{
        step: "How brands work",
        title: "Active brand → new products & runs",
        body: "Switch brands from the sidebar or below. Edit the listing brand kit for the active brand.",
        actionHref: STUDIO_ROUTES.brandProfile,
        actionLabel: "Brand kit",
        secondaryHref: STUDIO_ROUTES.projects,
        secondaryLabel: "View projects",
        variant: "accent",
      }}
    >
      {brands.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-serif text-xl">No brands yet</p>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">
              Create your first brand to organize products and playbooks.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <BrandCreateForm />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Inline create new brand card */}
          {brands.length < SOFT_BRAND_LIMIT && (
            <BrandCreateForm />
          )}

          {brands.map((brand) => {
            const stats = getBrandStats(brand.id);
            const isActive = brand.id === activeBrandId;
            return (
              <Card
                key={brand.id}
                className={
                  isActive
                    ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]"
                    : "border-[var(--border)]"
                }
              >
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl">{brand.name}</h2>
                      {brand.isDefault ? (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      ) : null}
                      {!brand.onboardingComplete ? (
                        <Badge variant="outline" className="text-xs">Kit incomplete</Badge>
                      ) : null}
                      {/* Active status badge */}
                      {isActive && (
                        <Badge
                          variant="default"
                          className="bg-[var(--accent)] text-[var(--accent-fg)] text-xs"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    {/* Stat chips */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-fg)]">
                        {stats.total} product{stats.total !== 1 ? "s" : ""}
                      </span>
                      {stats.complete > 0 && (
                        <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--success)]">
                          {stats.complete} complete
                        </span>
                      )}
                      {stats.failed > 0 && (
                        <span className="inline-flex items-center rounded-full bg-[var(--error)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--error)]">
                          {stats.failed} failed
                        </span>
                      )}
                      {stats.avgGradeScore != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
                          Avg {gradeLabel(stats.avgGradeScore)} ({stats.avgGradeScore})
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      <Link
                        href={projectsHref({ brandId: brand.id })}
                        className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                      >
                        View projects
                      </Link>
                      <Link
                        href={STUDIO_ROUTES.brandProfile}
                        className="text-[var(--muted-fg)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                      >
                        Edit brand kit
                      </Link>
                    </div>
                  </div>
                  <BrandActivateButton brandId={brand.id} active={isActive} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </StudioPageShell>
  );
}
