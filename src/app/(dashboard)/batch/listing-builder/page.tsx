import Link from "next/link";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export default function ListingBuilderPage() {
  return (
    <StudioPageShell
      eyebrow="Batch"
      title="Listing builder"
      description="Build many listings at once — upload a catalog, map fields, and run playbooks or templates across every SKU."
      guide={{
        step: "Phase 2",
        title: "Batch listing builder is queued",
        body: "Next: CSV/catalog import, field mapping, and playbook assignment per row. For now, use Image studio and Copy studio on each project.",
        actionHref: STUDIO_ROUTES.images,
        actionLabel: "Open Image studio",
        secondaryHref: STUDIO_ROUTES.projects,
        secondaryLabel: "View projects",
        variant: "accent",
      }}
    >
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold">Coming in Phase 2</p>
            <p className="mt-1 text-sm text-[var(--muted-fg)]">
              Multi-SKU intake, translation columns, and credit quotes for the whole batch before you run.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/batch/clone">Try Clone instead</Link>
          </Button>
        </CardContent>
      </Card>
    </StudioPageShell>
  );
}
