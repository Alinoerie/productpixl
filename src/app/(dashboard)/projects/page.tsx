import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardProjectCard } from "@/components/dashboard/dashboard-project-card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PAGE_SIZE = 24;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { assets: { orderBy: { moduleId: "asc" } }, listingCopy: true },
    }),
    prisma.product.count({ where: { userId: session.user.id } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="font-serif text-xl">No projects yet</p>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">
              Start with an image run or generate listing copy from the studio.
            </p>
            <Button asChild className="mt-6">
              <Link href="/generate">Open image studio</Link>
            </Button>
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
                  createdAt={p.createdAt}
                  hasCopy={Boolean(p.listingCopy?.title)}
                  thumbs={thumbs}
                />
              );
            })}
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
              <p className="text-sm text-[var(--muted-fg)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" disabled={page <= 1}>
                  <Link href={page <= 1 ? "#" : `/projects?page=${page - 1}`}>Previous</Link>
                </Button>
                <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
                  <Link href={page >= totalPages ? "#" : `/projects?page=${page + 1}`}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
