"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phase2ComingSoonBanner } from "@/components/ui/phase2-coming-soon-banner";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export function StartPlaybookForm({
  playbookTitle,
  brandName,
  products,
}: {
  playbookSlug: string;
  playbookTitle: string;
  brandId: string;
  brandName: string;
  products: { id: string; name: string; status: string }[];
}) {
  return (
    <div className="space-y-4">
      <Phase2ComingSoonBanner
        title="Playbook runs aren't live yet"
        body={`${playbookTitle} will batch prompts across your ${brandName} catalog in Phase 2. For now, run Image studio and Copy studio on each project.`}
      />
      <Card className="opacity-90">
        <CardHeader>
          <CardTitle className="text-base">Catalog preview (Phase 2)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.length === 0 ? (
            <p className="text-sm text-[var(--muted-fg)]">
              No projects yet for this brand.{" "}
              <Link href={STUDIO_ROUTES.images} className="text-[var(--accent)] underline-offset-2 hover:underline">
                Create your first project in Image studio
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              <Label>Projects that would be included</Label>
              <ul className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-dashed border-[var(--border)] p-3">
                {products.slice(0, 12).map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-[var(--muted-fg)]"
                  >
                    <span className="h-4 w-4 shrink-0 rounded border border-[var(--border)] bg-[var(--muted)]/40" />
                    <span>{product.name}</span>
                    <span className="ml-auto text-xs">{product.status}</span>
                  </li>
                ))}
                {products.length > 12 ? (
                  <li className="px-2 py-1 text-xs text-[var(--muted-fg)]">
                    + {products.length - 12} more projects
                  </li>
                ) : null}
              </ul>
            </div>
          )}
          <p className="text-xs text-[var(--muted-fg)]">
            Saving playbook runs and batch generation will unlock here — no credits are charged from this preview.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
