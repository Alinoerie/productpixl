import Link from "next/link";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phase2ComingSoonBanner } from "@/components/ui/phase2-coming-soon-banner";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export default function CloneCatalogPage() {
  return (
    <StudioPageShell
      eyebrow="Batch"
      title="Clone catalog"
      description="Turn one winning listing into variations, translations, and catalog expansions — batch clone runs ship in Phase 2."
      guide={{
        step: "Phase 2",
        title: "Clone: 1 listing → many SKUs",
        body: "For now, duplicate work manually: open a project, run Image studio and Copy studio, then adjust intake fields per variation.",
        actionHref: STUDIO_ROUTES.projects,
        actionLabel: "View projects",
        secondaryHref: STUDIO_ROUTES.images,
        secondaryLabel: "Open Image studio",
        variant: "accent",
      }}
    >
      <Phase2ComingSoonBanner
        title="Catalog clone — coming in Phase 2"
        body="Variation axes, marketplace translations, and batch credit quotes before a run will land here. Scale-plan gating follows when billing is live."
        primaryHref={STUDIO_ROUTES.projects}
        primaryLabel="View projects"
        secondaryHref={STUDIO_ROUTES.images}
        secondaryLabel="Open Image studio"
      />
      <Card>
        <CardContent className="space-y-4 p-6 text-sm text-[var(--muted-fg)]">
          <p className="font-medium text-[var(--foreground)]">Planned variation modes</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Attribute variations (size, color, pack count)</li>
            <li>Marketplace translations (DE, FR, NL, ES…)</li>
            <li>Catalog expansion from inspiration listings</li>
            <li>Batch credit quote before run</li>
          </ul>
          <Button asChild variant="outline">
            <Link href={STUDIO_ROUTES.pricing}>Preview Scale pricing</Link>
          </Button>
        </CardContent>
      </Card>
    </StudioPageShell>
  );
}
