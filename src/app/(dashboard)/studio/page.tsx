import Link from "next/link";
import { ArrowRight, Camera, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { BrandSetupNudge } from "@/components/ui/brand-setup-nudge";
import { isBrandProfileConfigured } from "@/lib/brand-profile";
import { DashboardProjectCard } from "@/components/dashboard/dashboard-project-card";
import { ActiveRunsPanel } from "@/components/dashboard/active-runs-panel";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardJourney } from "@/lib/user-journey";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { getActiveBrand } from "@/lib/brands";

export default async function ContentStudioOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ firstRun?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const journey = await getDashboardJourney(session.user.id);
  const activeBrand = await getActiveBrand(session.user.id);

  const [products, totalProjects, user, activeRuns, exportReady, failedCount, brandConfigured, brandCount] =
    await Promise.all([
    prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 9,
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
    prisma.brand.count({ where: { userId: session.user.id } }),
  ]);

  const credits = user?.credits ?? 0;

  return (
    <StudioPageShell
      eyebrow="Content studio"
      title={session.user.name ? `Hi ${session.user.name.split(" ")[0]}` : "Content studio"}
      description={`Create listing images and copy for ${activeBrand.name}. Pick a workflow below — credits are quoted before anything runs.`}
      guide={params.firstRun === "1" ? undefined : journey}
    >
      {params.firstRun === "1" ? (
        <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/30 px-4 py-4 text-sm md:flex md:items-center md:justify-between md:gap-4">
          <p>
            <strong>Brand kit saved.</strong> Upload one product photo to generate your first gallery — credits are
            quoted before anything runs.
          </p>
          <Button asChild className="mt-3 shrink-0 md:mt-0">
            <Link href={STUDIO_ROUTES.images}>
              Start first gallery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      {totalProjects === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-sm text-[var(--muted-fg)]">
          <strong className="text-[var(--foreground)]">Batch tools & playbooks</strong> unlock after your first
          project — tap <strong className="text-[var(--foreground)]">More</strong> in the bottom bar (or the menu
          icon up top) once you have a project, or start in Images / Copy below.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-[var(--accent)]/20">
          <CardContent className="flex h-full flex-col p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <Camera className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="mt-4 font-serif text-xl">Images</h2>
            <p className="mt-2 flex-1 text-sm text-[var(--muted-fg)]">
              Upload a product photo → hero, lifestyle, and detail gallery modules.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href={STUDIO_ROUTES.images}>
                Open images
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-full flex-col p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--teal-soft)]">
              <FileText className="h-5 w-5 text-[var(--teal)]" />
            </div>
            <h2 className="mt-4 font-serif text-xl">Copy</h2>
            <p className="mt-2 flex-1 text-sm text-[var(--muted-fg)]">
              Title, bullets, description, and backend keywords — RUFUS-ready.
            </p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link href={STUDIO_ROUTES.copy}>
                Open copy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-4">
        {[
          { label: "Credits", value: credits, href: STUDIO_ROUTES.pricing },
          { label: "Projects", value: totalProjects, href: STUDIO_ROUTES.projects },
          { label: "Export-ready", value: exportReady, href: `${STUDIO_ROUTES.projects}?ready=export` },
          { label: "Brands", value: brandCount, href: STUDIO_ROUTES.brandsList },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-xl px-2 py-1 hover:bg-[var(--muted)]/50">
            <p className="font-serif text-2xl">{stat.value}</p>
            <p className="text-xs uppercase tracking-wide text-[var(--muted-fg)]">{stat.label}</p>
          </Link>
        ))}
      </div>

      {credits === 0 ? (
        <p className="rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
          No credits left — images and copy are locked until you{" "}
          <Link href={`${STUDIO_ROUTES.pricing}?locked=1`} className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            upgrade or top up
          </Link>
          .
        </p>
      ) : null}

      <BrandSetupNudge configured={brandConfigured} />
      <QuickActions credits={credits} />

      {activeRuns.length > 0 ? (
        <ActiveRunsPanel initialRuns={activeRuns} totalProjects={totalProjects} failedCount={failedCount} />
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-2xl">Recent work</h2>
          {totalProjects > 0 ? (
            <Link href={STUDIO_ROUTES.projects} className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              All projects →
            </Link>
          ) : null}
        </div>

        {products.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="grid gap-8 py-10 md:grid-cols-2 md:items-center">
              <div>
                <p className="font-serif text-xl">Nothing here yet</p>
                <p className="mt-2 text-sm text-[var(--muted-fg)]">
                  Start in Images or Copy — work saves as projects under Library.
                </p>
              </div>
              <ShowcaseMosaic className="opacity-90" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </StudioPageShell>
  );
}
