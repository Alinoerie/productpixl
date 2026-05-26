import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlaybook } from "@/lib/playbooks/catalog";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

export default async function MyPlaybooksPage({
  searchParams,
}: {
  searchParams: Promise<{ started?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const params = await searchParams;

  const [saved, runs] = await Promise.all([
    prisma.savedPlaybook.findMany({
      where: { userId: session.user.id },
      include: { brand: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.playbookRun.findMany({
      where: { userId: session.user.id },
      include: { brand: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <StudioPageShell
      eyebrow="Playbooks"
      title="My playbooks"
      description="Saved playbook + brand combos for repeat catalog runs — batch execution arrives in Phase 2."
      headerActions={
        <Button asChild size="sm">
          <Link href={STUDIO_ROUTES.playbooks}>Browse expert playbooks</Link>
        </Button>
      }
      guide={
        params.started
          ? {
              step: "Phase 2",
              title: "Playbook runs aren't live yet",
              body: "Saved playbook templates will queue catalog runs in Phase 2. Use Image studio and Copy studio on each project today.",
              actionHref: STUDIO_ROUTES.images,
              actionLabel: "Open Image studio",
              secondaryHref: STUDIO_ROUTES.projects,
              secondaryLabel: "View projects",
              variant: "accent",
            }
          : {
              step: "Phase 2 preview",
              title: "Browse playbooks, run per project today",
              body: "Expert playbooks show prompt direction you can preview now. Batch runs across your catalog ship in Phase 2.",
              actionHref: STUDIO_ROUTES.playbooks,
              actionLabel: "Browse playbooks",
              secondaryHref: STUDIO_ROUTES.images,
              secondaryLabel: "Open Image studio",
              variant: "muted",
            }
      }
    >
      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Saved templates</h2>
        {saved.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-[var(--muted-fg)]">
              No saved playbooks yet. Preview prompt direction from{" "}
              <Link href={STUDIO_ROUTES.playbooks} className="text-[var(--accent)] underline-offset-2 hover:underline">
                Expert playbooks
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {saved.map((item) => {
              const playbook = getPlaybook(item.playbookSlug);
              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted-fg)]">
                          {playbook?.title ?? item.playbookSlug} · {item.brand.name}
                        </p>
                      </div>
                      <Badge variant="secondary">Saved</Badge>
                    </div>
                    <Button asChild size="sm" variant="outline" className="mt-4">
                      <Link href={`/playbooks/${item.playbookSlug}`}>Preview playbook</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">Recent runs</h2>
        {runs.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">
            Saved runs from early testing may appear here. Batch execution is Phase 2 — use Image studio per project today.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
            {runs.map((run) => {
              const playbook = getPlaybook(run.playbookSlug);
              return (
                <li key={run.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{run.name ?? playbook?.title}</p>
                    <p className="text-xs text-[var(--muted-fg)]">
                      {run.brand.name} · {new Date(run.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{run.status}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </StudioPageShell>
  );
}
