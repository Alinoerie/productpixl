import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileText, ImageIcon, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { BrandSetupNudge } from "@/components/ui/brand-setup-nudge";
import { isBrandProfileConfigured } from "@/lib/brand-profile";
import { cn } from "@/lib/utils";
import { DashboardProjectCard } from "@/components/dashboard/dashboard-project-card";
import { ActiveRunsPanel } from "@/components/dashboard/active-runs-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [products, totalProjects, user, activeRuns, exportReady, failedCount, brandConfigured] = await Promise.all([
    prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { assets: { orderBy: { moduleId: "asc" } }, listingCopy: true },
    }),
    prisma.product.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } }),
    prisma.product.findMany({
      where: { userId: session.user.id, status: { in: ["QUEUED", "PROCESSING", "FAILED"] } },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, name: true, status: true },
    }),
    prisma.product.count({
      where: {
        userId: session.user.id,
        listingCopy: { title: { not: null } },
        assets: { some: { imageUrl: { not: null } } },
      },
    }),
    prisma.product.count({ where: { userId: session.user.id, status: "FAILED" } }),
    isBrandProfileConfigured(session.user.id),
  ]);

  const credits = user?.credits ?? 0;
  const isFirstRun = totalProjects === 0;
  const heroStats = [
    { label: "Credits", value: String(credits), href: "/pricing" as const },
    { label: "Projects", value: String(totalProjects), href: "/projects" as const },
    ...(failedCount > 0
      ? [{ label: "Needs fix", value: String(failedCount), href: "/projects?status=FAILED" as const }]
      : []),
    { label: "Export-ready", value: String(exportReady), href: "/projects?ready=export" as const },
  ];

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--ink)] p-8 text-white md:p-10">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-[var(--accent-soft)]/90">Listing studio</p>
            <h1 className="mt-2 font-serif text-3xl md:text-4xl">
              {isFirstRun
                ? "Welcome to your studio"
                : `Welcome back${session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}`}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/70">
              {isFirstRun
                ? "You have 10 free credits — start with an image run, listing copy, or grade a listing free."
                : "Upload one product photo — get hero, lifestyle, detail images and optional listing copy."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Link href="/copy">
                <FileText className="h-4 w-4" />
                Listing copy
              </Link>
            </Button>
            <Button asChild className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
              <Link href="/generate">
                <Plus className="h-4 w-4" />
                New image run
              </Link>
            </Button>
          </div>
        </div>
        <div
          className={cn(
            "relative mt-8 grid gap-4 border-t border-white/10 pt-8",
            heroStats.length === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"
          )}
        >
          {heroStats.map((s) => (
            <div key={s.label}>
              <Link href={s.href} className="group block rounded-lg transition-colors hover:bg-white/5">
                <p className="font-serif text-2xl group-hover:text-[var(--accent-soft)]">{s.value}</p>
                <p className="text-xs uppercase tracking-wide text-white/50">{s.label}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {credits === 0 ? (
        <div className="rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
          Free credits used — image studio and copy are locked.{" "}
          <Link href="/pricing?locked=1" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            View pricing
          </Link>
        </div>
      ) : credits < 2 ? (
        <div className="rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
          Running low on credits ({credits} left).{" "}
          <Link href="/pricing?locked=1" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Top up before your next run
          </Link>
        </div>
      ) : null}

      <BrandSetupNudge configured={brandConfigured} />

      <QuickActions credits={credits} />

      {activeRuns.length > 0 ? (
        <ActiveRunsPanel
          initialRuns={activeRuns}
          totalProjects={totalProjects}
          failedCount={failedCount}
        />
      ) : null}

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-2xl">Recent projects</h2>
          {totalProjects > products.length ? (
            <Link
              href="/projects"
              className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              View all {totalProjects} projects →
            </Link>
          ) : totalProjects > 0 ? (
            <span className="text-sm text-[var(--muted-fg)]">{totalProjects} saved</span>
          ) : null}
        </div>

        {products.length === 0 ? (
          <Card className="overflow-hidden border-dashed">
            <CardContent className="grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)] md:items-center md:px-10">
              <div className="text-center md:text-left">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] md:mx-0">
                  <ImageIcon className="h-8 w-8 text-[var(--accent)]" strokeWidth={1.25} />
                </div>
                <h3 className="mt-6 font-serif text-xl">Your studio is empty</h3>
                <p className="mt-2 max-w-sm text-sm text-[var(--muted-fg)] md:max-w-md">
                  Start with an image run or generate listing copy — every run saves as a project you can return to. Or
                  grade an existing listing free before you spend credits.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                  <Button asChild size="lg">
                    <Link href="/generate">
                      Open image studio
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/copy">Generate listing copy</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/grader">
                      <ClipboardCheck className="h-4 w-4" />
                      Grade a listing free
                    </Link>
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)] md:text-left">
                  Example outputs
                </p>
                <ShowcaseMosaic />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const thumbs = p.assets.filter((a) => a.imageUrl).slice(0, 4);
              return (
                <DashboardProjectCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  status={p.status}
                  marketplace={p.marketplace}
                  createdAt={p.createdAt}
                  hasCopy={Boolean(p.listingCopy?.title)}
                  hasImages={thumbs.length > 0}
                  thumbs={thumbs}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
