import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PLAYBOOK_CATALOG } from "@/lib/playbooks/catalog";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phase2ComingSoonBanner } from "@/components/ui/phase2-coming-soon-banner";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export default function PlaybooksPage() {
  return (
    <StudioPageShell
      eyebrow="Playbooks"
      title="Expert playbooks"
      description="Channel-specific prompt packs for catalog-scale runs. Preview what's coming — batch execution lands in Phase 2."
      guide={{
        step: "Phase 2",
        title: "Browse playbooks today, run them at scale soon",
        body: "Each playbook combines marketplace best practices with your brand profile. Use Image studio and Copy studio on individual projects until batch runs ship.",
        actionHref: STUDIO_ROUTES.images,
        actionLabel: "Open Image studio",
        secondaryHref: STUDIO_ROUTES.projects,
        secondaryLabel: "View projects",
        variant: "accent",
      }}
    >
      <Phase2ComingSoonBanner />
      <div id="playbook-grid" className="grid gap-4 scroll-mt-24 sm:grid-cols-2 xl:grid-cols-3">
        {PLAYBOOK_CATALOG.map((playbook) => (
          <Card key={playbook.slug} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{playbook.channel}</p>
              <h2 className="mt-2 font-serif text-xl">{playbook.title}</h2>
              <p className="mt-2 flex-1 text-sm text-[var(--muted-fg)]">{playbook.subtitle}</p>
              <p className="mt-4 text-xs text-[var(--muted-fg)]">{playbook.creditHint}</p>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href={`/playbooks/${playbook.slug}`}>
                  Preview playbook
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </StudioPageShell>
  );
}
