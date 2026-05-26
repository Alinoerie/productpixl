import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { DashboardProjectCard } from "@/components/dashboard/dashboard-project-card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { ProjectsFilterBar, buildProjectsQuery } from "@/components/projects/projects-filter-bar";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 24;

function buildWhere(
  userId: string,
  filters: { status?: string; copy?: string; images?: string; ready?: string; q?: string }
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { userId };

  if (filters.status && ["COMPLETE", "PROCESSING", "FAILED", "QUEUED"].includes(filters.status)) {
    where.status = filters.status;
  }

  if (filters.q?.trim()) {
    where.name = { contains: filters.q.trim(), mode: "insensitive" };
  }

  if (filters.copy === "with") {
    where.listingCopy = { title: { not: null } };
  } else if (filters.copy === "without") {
    where.OR = [
      { listingCopy: { is: null } },
      { listingCopy: { is: { title: null } } },
      { listingCopy: { is: { title: "" } } },
    ];
  }

  if (filters.images === "with") {
    where.assets = { some: { imageUrl: { not: null } } };
  } else if (filters.images === "without") {
    where.NOT = { assets: { some: { imageUrl: { not: null } } } };
  }

  if (filters.ready === "export") {
    where.listingCopy = { title: { not: null } };
    where.assets = { some: { imageUrl: { not: null } } };
  }

  return where;
}

function FiltersFallback() {
  return <Skeleton className="h-40 w-full rounded-2xl" />;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; copy?: string; images?: string; ready?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const filters = {
    status: params.status,
    copy: params.copy,
    images: params.images,
    ready: params.ready,
    q: params.q,
  };
  const where = buildWhere(session.user.id, filters);

  const [products, filtered, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { assets: { orderBy: { moduleId: "asc" } }, listingCopy: true },
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { userId: session.user.id } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered / PAGE_SIZE));
  const hasFilters = Boolean(
    filters.status || filters.copy || filters.images || filters.ready || filters.q?.trim()
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Studio"
        title="All projects"
        description={`${total} saved project${total === 1 ? "" : "s"} — image runs and listing copy.`}
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            Back to studio
          </Link>
        </Button>
      </PageHeader>

      {total > 0 ? (
        <Suspense fallback={<FiltersFallback />}>
          <ProjectsFilterBar total={total} filtered={filtered} />
        </Suspense>
      ) : null}

      {total === 0 ? (
        <Card className="overflow-hidden border-dashed">
          <CardContent className="grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)] md:items-center md:px-10">
            <div className="text-center md:text-left">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] md:mx-0">
                <ImageIcon className="h-8 w-8 text-[var(--accent)]" strokeWidth={1.25} />
              </div>
              <h3 className="mt-6 font-serif text-xl">No projects yet</h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--muted-fg)] md:max-w-md">
                Start with an image run or generate listing copy — every run saves as a project you can return to.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                <Button asChild size="lg">
                  <Link href="/generate">Open image studio</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/copy">Generate listing copy</Link>
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
      ) : products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="font-serif text-xl">
              {filters.status === "FAILED" ? "No failed projects" : "No matches"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">
              {filters.status === "FAILED"
                ? "All image runs completed successfully — or failures were retried already."
                : "Try clearing filters or search with a different product name."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/projects">Clear filters</Link>
              </Button>
              {filters.status === "FAILED" ? (
                <Button asChild>
                  <Link href="/generate">Start new image run</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/generate">Open image studio</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
              <p className="text-sm text-[var(--muted-fg)]">
                Page {page} of {totalPages}
                {hasFilters ? " (filtered)" : ""}
              </p>
              <div className="flex gap-2">
                {page <= 1 ? (
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/projects${buildProjectsQuery({ ...filters, page: String(page - 1) })}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                {page >= totalPages ? (
                  <Button variant="outline" size="sm" disabled>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/projects${buildProjectsQuery({ ...filters, page: String(page + 1) })}`}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
