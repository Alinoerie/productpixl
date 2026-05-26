import Link from "next/link";
import { Button } from "@/components/ui/button";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export function Phase2ComingSoonBanner({
  title = "Batch playbooks — coming in Phase 2",
  body = "Catalog-wide playbook runs and batch listing builder aren't live yet. Use Image studio and Copy studio on individual projects today.",
  primaryHref = STUDIO_ROUTES.images,
  primaryLabel = "Open Image studio",
  secondaryHref = STUDIO_ROUTES.copy,
  secondaryLabel = "Open Copy studio",
}: {
  title?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-4 sm:px-5">
      <p className="font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted-fg)]">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
