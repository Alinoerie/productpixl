import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SOFT_BRAND_LIMIT } from "@/lib/brands";
import { createBrandFormAction } from "./actions";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export default async function NewBrandPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const brandCount = await prisma.brand.count({ where: { userId: session.user.id } });
  const atLimit = brandCount >= SOFT_BRAND_LIMIT;

  return (
    <StudioPageShell
      eyebrow="Brand"
      title="Create a new brand"
      description={
        atLimit
          ? `You've reached the soft limit of ${SOFT_BRAND_LIMIT} brands. Remove one or contact us for more.`
          : "Separate catalogs, colors, and copy voice — ideal for agencies or multi-brand sellers."
      }
      guide={{
        step: "After you create",
        title: "Set it active in the sidebar",
        body: "Switch brands anytime from the sidebar dropdown. Open Brand kit to set colors and listing voice.",
        actionHref: STUDIO_ROUTES.brandsList,
        actionLabel: "All brands",
        secondaryHref: STUDIO_ROUTES.brandProfile,
        secondaryLabel: "Brand kit",
      }}
    >
      <Card className="mx-auto max-w-lg">
        <CardContent className="p-6">
          {atLimit ? (
            <p className="text-sm text-[var(--muted-fg)]">
              Brand creation is paused at {SOFT_BRAND_LIMIT} brands until subscription billing ships.
            </p>
          ) : (
          <form action={createBrandFormAction} className="space-y-4">
            <div>
              <Label htmlFor="name">Brand name</Label>
              <Input id="name" name="name" required placeholder="e.g. Studio Iris" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="description">Short description (optional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Premium skincare for EU marketplaces"
                className="mt-2"
              />
            </div>
            <Button type="submit" className="w-full">
              Create brand
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </StudioPageShell>
  );
}
