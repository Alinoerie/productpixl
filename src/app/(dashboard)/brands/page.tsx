import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveBrandId, listBrandsForUser } from "@/lib/brands";
import { BrandActivateButton } from "@/components/brand/brand-activate-button";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { STUDIO_ROUTES, projectsHref } from "@/lib/studio-routes";

export default async function BrandsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [brands, activeBrandId] = await Promise.all([
    listBrandsForUser(session.user.id),
    getActiveBrandId(session.user.id),
  ]);

  const productCounts = await prisma.product.groupBy({
    by: ["brandId"],
    where: { userId: session.user.id },
    _count: { id: true },
  });

  const countByBrandId = new Map(
    productCounts.map((row) => [row.brandId ?? "none", row._count.id])
  );

  return (
    <StudioPageShell
      eyebrow="Brand"
      title="All brands"
      description="One listing brand kit per catalog. The active brand in the sidebar drives colors, copy tone, and new product defaults."
      headerActions={
        <Button asChild size="sm">
          <Link href="/brands/new">New brand</Link>
        </Button>
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
            <Button asChild className="mt-6">
              <Link href="/brands/new">Create brand</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {brands.map((brand) => {
            const productCount = countByBrandId.get(brand.id) ?? 0;
            const isActive = brand.id === activeBrandId;
            return (
              <Card key={brand.id} className={isActive ? "border-[var(--accent)]/30" : undefined}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl">{brand.name}</h2>
                      {brand.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                      {!brand.onboardingComplete ? (
                        <Badge variant="outline">Kit incomplete</Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted-fg)]">
                      {productCount} product{productCount === 1 ? "" : "s"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      <Link
                        href={projectsHref({ brandId: brand.id })}
                        className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                      >
                        View projects
                      </Link>
                      {isActive ? (
                        <Link
                          href={STUDIO_ROUTES.brandProfile}
                          className="text-[var(--muted-fg)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                        >
                          Edit brand kit
                        </Link>
                      ) : null}
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
