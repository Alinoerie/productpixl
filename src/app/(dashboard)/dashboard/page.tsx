import Link from "next/link";
import { ArrowRight, FileText, ImageIcon, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { BrandSetupNudge } from "@/components/ui/brand-setup-nudge";
import { isBrandProfileConfigured } from "@/lib/brand-profile";
import { DashboardProjectCard } from "@/components/dashboard/dashboard-project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [products, totalProjects, user, activeRuns, brandConfigured] = await Promise.all([
    prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { assets: { orderBy: { moduleId: "asc" } }, listingCopy: true },
    }),
    prisma.product.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } }),
    prisma.product.findMany({
      where: { userId: session.user.id, status: { in: ["PROCESSING", "FAILED"] } },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, name: true, status: true },
    }),
    isBrandProfileConfigured(session.user.id),
  ]);

  const credits = user?.credits ?? 0;
  const complete = products.filter((p) => p.status === "COMPLETE").length;

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--ink)] p-8 text-white md:p-10">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-[var(--accent-soft)]/90">Listing studio</p>
            <h1 className="mt-2 font-serif text-3xl md:text-4xl">
              Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Upload one product photo — get hero, lifestyle, detail images and optional listing copy.
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
        <div className="relative mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
          {[
            { label: "Credits", value: String(credits), href: "/pricing" as const },
            { label: "Projects", value: String(totalProjects) },
            { label: "Complete", value: String(complete) },
          ].map((s) => (
            <div key={s.label}>
              {s.href ? (
                <Link href={s.href} className="group block rounded-lg transition-colors hover:bg-white/5">
                  <p className="font-serif text-2xl group-hover:text-[var(--accent-soft)]">{s.value}</p>
                  <p className="text-xs uppercase tracking-wide text-white/50">{s.label}</p>
                </Link>
              ) : (
                <>
                  <p className="font-serif text-2xl">{s.value}</p>
                  <p className="text-xs uppercase tracking-wide text-white/50">{s.label}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {credits < 2 && (
        <div className="rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
          Running low on credits ({credits} left).{" "}
          <Link href="/pricing" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            Top up before your next run
          </Link>
        </div>
      )}

      <BrandSetupNudge configured={brandConfigured} />

      <QuickActions credits={credits} />

      {activeRuns.length > 0 ? (
        <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/25 px-4 py-4">
          <p className="text-sm font-semibold">
            {activeRuns.filter((p) => p.status === "PROCESSING").length > 0
              ? `${activeRuns.filter((p) => p.status === "PROCESSING").length} run${
                  activeRuns.filter((p) => p.status === "PROCESSING").length === 1 ? "" : "s"
                } in progress`
              : "Needs attention"}
          </p>
          <ul className="mt-3 space-y-2">
            {activeRuns.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm transition-colors hover:border-[var(--accent)]/40"
                >
                  <span className="truncate font-medium">{p.name}</span>
                  <span
                    className={
                      p.status === "FAILED"
                        ? "shrink-0 text-[var(--error)]"
                        : "shrink-0 text-[var(--accent)]"
                    }
                  >
                    {p.status === "FAILED" ? "Failed · Retry" : "Processing…"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {totalProjects > activeRuns.length ? (
            <Link
              href="/projects"
              className="mt-3 inline-block text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              View all projects →
            </Link>
          ) : null}
        </div>
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
                  Drop a product photo to run the PHOILA image pipeline — L1 hero, L3 lifestyle, L4 detail in one
                  credit.
                </p>
                <Button asChild className="mt-8" size="lg">
                  <Link href="/generate">
                    Start first run
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
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
