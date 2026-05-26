import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductLiveGallery } from "@/components/products/product-live-gallery";
import { ProductDeleteButton } from "@/components/products/product-delete-button";
import { ProductExportActions } from "@/components/products/product-export-actions";
import { ProductListingPanel } from "@/components/products/product-listing-panel";
import { ProductReadiness } from "@/components/products/product-readiness";
import { ProductMobileActions } from "@/components/products/product-mobile-actions";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { getMarketplace } from "@/lib/marketplaces";
import {
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
    include: { assets: { orderBy: { moduleId: "asc" } }, listingCopy: true },
  });

  if (!product) notFound();

  const bullets = (product.listingCopy?.bullets as string[] | null) ?? [];
  const completedAssets = product.assets.filter((a) => a.status === "COMPLETE" && a.imageUrl);
  const galleryAssets = product.assets.map((a) => ({
    id: a.id,
    moduleId: a.moduleId,
    imageUrl: a.imageUrl,
    qaScore: a.qaScore,
    status: a.status,
    errorMessage: a.errorMessage,
  }));

  return (
    <div className="space-y-8 pb-28 md:pb-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-[var(--muted-fg)]">
        <Link href="/dashboard" className="hover:text-[var(--foreground)]">
          Studio
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
        <Link href="/projects" className="hover:text-[var(--foreground)]">
          Projects
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
            {completedAssets.length > 0 ? ` · ${completedAssets.length} images` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {completedAssets.length > 0 && !product.listingCopy?.title ? (
            <Button asChild>
              <Link href={`/copy?productId=${product.id}`}>Generate copy</Link>
            </Button>
          ) : null}
          {product.listingCopy?.title ? (
            <GradeListingButton
              productId={product.id}
              listingCopy={{
                title: product.listingCopy.title,
                bullets,
                description: product.listingCopy.description ?? undefined,
                backendKeywords: product.listingCopy.backendKeywords ?? undefined,
                productId: product.id,
              }}
            />
          ) : null}
          {product.status === "FAILED" ? (
            <Button asChild>
              <Link href={`/generate?productId=${product.id}`}>Retry run</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={`/generate?productId=${product.id}`}>New image run</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to studio</Link>
          </Button>
        </div>
      </div>

      {product.status === "FAILED" && (
        <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
          Generation failed. Try a new run from{" "}
          <Link href={`/generate?productId=${product.id}`} className="font-medium underline">
            Image studio
          </Link>{" "}
          or spot-edit individual modules below.
        </div>
      )}

      <ProductReadiness
        productId={product.id}
        imageCount={completedAssets.length}
        hasCopy={Boolean(product.listingCopy?.title)}
        listingCopy={
          product.listingCopy?.title
            ? {
                title: product.listingCopy.title,
                bullets,
                description: product.listingCopy.description,
                backendKeywords: product.listingCopy.backendKeywords,
              }
            : null
        }
        status={product.status}
      />

      <ProductExportActions
        productId={product.id}
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

      {product.assets.length > 0 || product.status === "PROCESSING" ? (
        <ProductLiveGallery
          productId={product.id}
          productName={product.name}
          initialAssets={galleryAssets}
          initialStatus={product.status}
        />
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-serif text-lg">No images yet</p>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">
              Start an image pipeline to populate this project.
            </p>
            <Button asChild className="mt-6">
              <Link href={`/generate?productId=${product.id}`}>Run image studio</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {product.listingCopy?.title ? (
        <ProductListingPanel
          productId={product.id}
          title={product.listingCopy.title}
          bullets={bullets}
          description={product.listingCopy.description}
          keywords={product.listingCopy.backendKeywords}
        />
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
              <Link href={`/copy?productId=${product.id}`}>Generate copy</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="border-t border-[var(--border)] pt-6">
        <ProductDeleteButton productId={product.id} productName={product.name} />
      </div>

      <ProductMobileActions
        productId={product.id}
        hasImages={completedAssets.length > 0}
        hasCopy={Boolean(product.listingCopy?.title)}
        status={product.status}
        listingCopy={
          product.listingCopy?.title
            ? {
                title: product.listingCopy.title,
                bullets,
                description: product.listingCopy.description,
                backendKeywords: product.listingCopy.backendKeywords,
              }
            : null
        }
      />
    </div>
  );
}
