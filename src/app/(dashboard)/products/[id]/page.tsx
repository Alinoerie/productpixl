import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductLiveStatus } from "@/components/products/product-live-status";
import { AssetSpotEdit } from "@/components/products/asset-spot-edit";
import { ProductExportActions } from "@/components/products/product-export-actions";
import { getMarketplace } from "@/lib/marketplaces";
import {
  formatModuleLabel,
  formatProductStatus,
  statusBadgeClass,
} from "@/lib/status-labels";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    include: { assets: true, listingCopy: true },
  });

  if (!product) notFound();

  const bullets = (product.listingCopy?.bullets as string[] | null) ?? [];
  const completedAssets = product.assets.filter((a) => a.status === "COMPLETE" && a.imageUrl);

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-[var(--muted-fg)]">
        <Link href="/dashboard" className="hover:text-[var(--foreground)]">
          Studio
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
        <span className="truncate text-[var(--foreground)]">{product.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl">{product.name}</h1>
            <Badge className={statusBadgeClass(product.status)}>
              {formatProductStatus(product.status)}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-[var(--muted-fg)]">
            {getMarketplace(product.marketplace).label} ·{" "}
            {new Date(product.createdAt).toLocaleDateString()}
            {product.listingCopy?.title ? " · Copy attached" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to studio</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/generate">New image run</Link>
          </Button>
        </div>
      </div>

      {product.status === "FAILED" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Generation failed. Try a new run from{" "}
          <Link href="/generate" className="font-medium underline">
            Image studio
          </Link>{" "}
          or spot-edit individual modules below.
        </div>
      )}

      <ProductExportActions
        productName={product.name}
        assets={product.assets}
        listingCopy={
          product.listingCopy
            ? {
                title: product.listingCopy.title,
                bullets: bullets,
                description: product.listingCopy.description,
                backendKeywords: product.listingCopy.backendKeywords,
              }
            : null
        }
      />

      {product.status === "PROCESSING" && <ProductLiveStatus productId={product.id} />}

      {product.assets.length > 0 ? (
        <section>
          <h2 className="mb-4 font-serif text-xl">Gallery images</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {product.assets.map((a) => (
              <Card key={a.id} className="group overflow-hidden transition-shadow hover:shadow-[var(--shadow-md)]">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-[var(--muted)]">
                    {a.imageUrl ? (
                      <a href={a.imageUrl} target="_blank" rel="noreferrer" className="block h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.imageUrl}
                          alt={`${product.name} — ${formatModuleLabel(a.moduleId)}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </a>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-[var(--muted-fg)]">
                        <span className="animate-pulse-soft">{formatProductStatus(a.status)}</span>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--ink)]/80 px-2 py-0.5 font-serif text-xs text-white">
                      {a.moduleId}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium">
                      {formatModuleLabel(a.moduleId)}
                      {a.qaScore != null ? ` · QA ${a.qaScore}/10` : ""}
                    </p>
                    {a.errorMessage && (
                      <p className="mt-2 text-xs text-red-600">{a.errorMessage}</p>
                    )}
                    {a.status === "COMPLETE" && a.imageUrl && (
                      <AssetSpotEdit productId={product.id} assetId={a.id} moduleId={a.moduleId} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : product.status !== "PROCESSING" ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-serif text-lg">No images yet</p>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">
              Start an image pipeline to populate this project.
            </p>
            <Button asChild className="mt-6">
              <Link href="/generate">Run image studio</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {product.listingCopy?.title ? (
        <section>
          <h2 className="mb-4 font-serif text-xl">Listing copy</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{product.listingCopy.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ul className="list-disc space-y-2 pl-5">
                {bullets.map((b, i) => (
                  <li key={`bullet-${i}-${b.slice(0, 12)}`}>{b}</li>
                ))}
              </ul>
              <p className="whitespace-pre-wrap text-[var(--muted-fg)]">{product.listingCopy.description}</p>
              <p className="text-xs">
                <strong>Keywords:</strong> {product.listingCopy.backendKeywords}
              </p>
            </CardContent>
          </Card>
        </section>
      ) : completedAssets.length > 0 ? (
        <Card className="border-[var(--teal)]/30 bg-[var(--teal-soft)]/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="font-semibold">Images ready — add listing copy?</p>
              <p className="mt-1 text-sm text-[var(--muted-fg)]">
                Generate RUFUS-ready title, bullets, and keywords for 1 credit.
              </p>
            </div>
            <Button asChild>
              <Link href="/copy">Generate copy</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
