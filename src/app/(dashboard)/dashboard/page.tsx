import Link from "next/link";
import { ArrowRight, FileText, ImageIcon, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [products, user] = await Promise.all([
    prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { assets: { take: 1 }, listingCopy: true },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } }),
  ]);

  const credits = user?.credits ?? 0;
  const complete = products.filter((p) => p.status === "COMPLETE").length;

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--ink)] p-8 text-white md:p-10">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-orange-200/80">Listing studio</p>
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
            { label: "Credits", value: String(credits) },
            { label: "Projects", value: String(products.length) },
            { label: "Complete", value: String(complete) },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-2xl">{s.value}</p>
              <p className="text-xs uppercase tracking-wide text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Recent projects</h2>
          {products.length > 0 && (
            <Link href="/generate" className="text-sm font-medium text-[var(--accent)] hover:underline">
              View all runs →
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <Card className="overflow-hidden border-dashed">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
                <ImageIcon className="h-8 w-8 text-[var(--accent)]" strokeWidth={1.25} />
              </div>
              <h3 className="mt-6 font-serif text-xl">Your studio is empty</h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--muted-fg)]">
                Drop a product photo to run the PHOILA image pipeline — L1 hero, L3 lifestyle, L4 detail in one
                credit.
              </p>
              <Button asChild className="mt-8" size="lg">
                <Link href="/generate">
                  Start first run
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group">
                <Card className="overflow-hidden transition-all hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]">
                  <div className="relative aspect-[4/3] bg-[var(--muted)]">
                    {p.assets[0]?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.assets[0].imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="animate-pulse-soft text-sm text-[var(--muted-fg)]">
                          Generating…
                        </span>
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute left-3 top-3 bg-[var(--card)]/90 backdrop-blur-sm"
                    >
                      {p.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-semibold leading-snug group-hover:text-[var(--accent)]">
                      {p.name}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-fg)]">
                      {p.pipelineType} · {new Date(p.createdAt).toLocaleDateString()}
                      {p.listingCopy ? " · Copy ready" : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
