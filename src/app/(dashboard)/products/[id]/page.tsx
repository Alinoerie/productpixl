import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResetStuckRunButton } from "@/components/products/reset-stuck-run-button";
import { ProductLiveGallery } from "@/components/products/product-live-gallery";
import { PipelineErrorMessage } from "@/components/ui/pipeline-error-message";
import { PipelineProgressBar } from "@/components/ui/pipeline-progress-bar";
import { ProductDeleteButton } from "@/components/products/product-delete-button";
import { ProductExportActions } from "@/components/products/product-export-actions";
import { ProductListingPanel } from "@/components/products/product-listing-panel";
import { ProductReadiness } from "@/components/products/product-readiness";
import { ProductMobileActions } from "@/components/products/product-mobile-actions";
import { ProductEditProvider } from "@/components/products/product-edit-context";
import { ProductCollapsibleSection } from "@/components/products/product-collapsible-section";
import { ProductSectionNav } from "@/components/products/product-section-nav";
import { ProductOnboardingCard } from "@/components/products/product-onboarding-card";
import { ProductGradeBadge } from "@/components/products/product-grade-badge";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { getMarketplace, type MarketplaceId } from "@/lib/marketplaces";
import {
  formatProductStatus,
  statusBadgeClass,
} from "@/lib/status-labels";
import {
  intakeFromProduct,
  quoteCopyRun,
  quoteRegenerateModule,
} from "@/lib/credit-pricing";
import type { ListingModuleId } from "@/pipelines/modules";
import { NextStepGuide } from "@/components/ui/next-step-guide";
import { getProductJourney } from "@/lib/user-journey";
import { PIPELINE_ERROR, toSellerPipelineError } from "@/lib/pipeline-errors";
import { isQueuedStale, type PipelineStatusShape } from "@/lib/pipeline-progress";
import { STUDIO_ROUTES, studioCopyHref, studioImagesHref } from "@/lib/studio-routes";

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
  const hasGallery = product.assets.length > 0 || product.status === "PROCESSING";
  const isNewProject =
    completedAssets.length === 0 &&
    !product.listingCopy?.title &&
    product.status !== "PROCESSING" &&
    product.status !== "QUEUED";
  const showPublishSections = completedAssets.length > 0 || Boolean(product.listingCopy?.title);
  const galleryAssets = product.assets.map((a) => ({
    id: a.id,
    moduleId: a.moduleId,
    imageUrl: a.imageUrl,
    qaScore: a.qaScore,
    status: a.status,
    errorMessage: a.errorMessage,
  }));

  const intake = intakeFromProduct(product);
  const copyQuote = quoteCopyRun({ marketplace: product.marketplace, intake });
  const moduleCreditCosts = Object.fromEntries(
    [...new Set(product.assets.map((a) => a.moduleId))].map((moduleId) => [
      moduleId,
      quoteRegenerateModule(moduleId as ListingModuleId, product.marketplace, intake).total,
    ])
  );

  const journey = getProductJourney({
    productId: product.id,
    status: product.status,
    completedImages: completedAssets.length,
    hasCopy: Boolean(product.listingCopy?.title),
  });
  const queuedStale = isQueuedStale(product.status, product.pipelineStatus, product.updatedAt);
  const runInProgress = product.status === "QUEUED" || product.status === "PROCESSING";
  const pipelineErrorMessage = toSellerPipelineError(
    (product.pipelineStatus as PipelineStatusShape | null)?.error ?? PIPELINE_ERROR.generationFailed
  );

  return (
    <ProductEditProvider>
      <div className="space-y-8 pb-[calc(var(--mobile-nav-offset)+4rem)] md:pb-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-[var(--muted-fg)]">
          <Link href={STUDIO_ROUTES.home} className="hover:text-[var(--foreground)]">
            Content studio
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
          <Link href={STUDIO_ROUTES.projects} className="hover:text-[var(--foreground)]">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
          <span className="truncate text-[var(--foreground)]" aria-current="page">
            {product.name}
          </span>
        </nav>

        <NextStepGuide {...journey} />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl">{product.name}</h1>
              <Badge className={statusBadgeClass(product.status)}>
                {formatProductStatus(product.status)}
              </Badge>
              {product.listingCopy?.title ? (
                <ProductGradeBadge
                  productId={product.id}
                  initialGrade={product.listingCopy.grade}
                  initialScore={product.listingCopy.gradeScore}
                  listingCopy={{
                    title: product.listingCopy.title,
                    bullets,
                    description: product.listingCopy.description ?? undefined,
                    backendKeywords: product.listingCopy.backendKeywords ?? undefined,
                    productId: product.id,
                  }}
                />
              ) : null}
            </div>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">
              {getMarketplace(product.marketplace).label} ·{" "}
              {new Date(product.createdAt).toLocaleDateString()}
              {product.listingCopy?.title ? " · Copy attached" : ""}
              {completedAssets.length > 0 ? ` · ${completedAssets.length} images` : ""}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row md:hidden">
            {completedAssets.length > 0 && !product.listingCopy?.title ? (
              <Button asChild className="w-full">
                <Link href={studioCopyHref(product.id)}>Generate copy</Link>
              </Button>
            ) : null}
            {product.status === "FAILED" ? (
              <Button asChild className="w-full">
                <Link href={studioImagesHref({ productId: product.id })}>Retry run</Link>
              </Button>
            ) : runInProgress ? (
              <ResetStuckRunButton productId={product.id} label="Reset stuck run" variant="outline" className="w-full" />
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href={studioImagesHref({ productId: product.id })}>New image run</Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="w-full">
              <Link href={STUDIO_ROUTES.home}>Back to studio</Link>
            </Button>
          </div>
          <div className="hidden flex-wrap gap-2 md:flex">
            {completedAssets.length > 0 && !product.listingCopy?.title ? (
              <Button asChild>
                <Link href={studioCopyHref(product.id)}>Generate copy</Link>
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
                <Link href={studioImagesHref({ productId: product.id })}>Retry run</Link>
              </Button>
            ) : runInProgress ? (
              <ResetStuckRunButton productId={product.id} label="Reset stuck run" variant="outline" />
            ) : (
              <Button asChild variant="outline">
                <Link href={studioImagesHref({ productId: product.id })}>New image run</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={STUDIO_ROUTES.home}>Back to studio</Link>
            </Button>
          </div>
        </div>

        <ProductSectionNav
          hasCopy={Boolean(product.listingCopy?.title)}
          hasGallery={hasGallery || completedAssets.length === 0}
          compact={!showPublishSections}
        />

        {isNewProject ? <ProductOnboardingCard productId={product.id} /> : null}

        {runInProgress ? (
          <div className="space-y-3 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/25 px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">Image generation in progress</p>
                <p className="mt-1 text-sm text-[var(--muted-fg)]">
                  {queuedStale
                    ? PIPELINE_ERROR.queuedStale
                    : "This usually finishes in a few minutes. You can leave this page — progress updates automatically."}
                </p>
              </div>
              <ResetStuckRunButton productId={product.id} label="Reset run" variant="outline" size="sm" />
            </div>
            <PipelineProgressBar
              status={product.status}
              pipelineStatus={product.pipelineStatus as PipelineStatusShape | null}
              queuedStale={queuedStale}
            />
          </div>
        ) : null}

        {product.status === "FAILED" && (
          <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
            <PipelineErrorMessage
              message={pipelineErrorMessage}
              supportSubject="ProductPixl image generation issue"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={studioImagesHref({ productId: product.id })}>Retry in Images</Link>
              </Button>
            </div>
          </div>
        )}

        {product.listingCopy?.status === "FAILED" ? (
          <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
            <p>{toSellerPipelineError(product.listingCopy.errorMessage ?? PIPELINE_ERROR.copyFailed)}</p>
            <Button asChild size="sm" variant="outline" className="mt-3 border-[var(--error-border)]">
              <Link href={studioCopyHref(product.id)}>Retry in Copy</Link>
            </Button>
          </div>
        ) : null}

        <div id="gallery" className="scroll-mt-24">
          {hasGallery ? (
            <ProductLiveGallery
              productId={product.id}
              productName={product.name}
              initialAssets={galleryAssets}
              initialStatus={product.status}
              moduleCreditCosts={moduleCreditCosts}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="font-serif text-lg">
                  {product.listingCopy?.title ? "Copy saved — add gallery images" : "No images yet"}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-fg)]">
                  {product.listingCopy?.title
                    ? "Upload a product photo in Image studio to generate your gallery."
                    : "Start in Image studio to populate this project."}
                </p>
                <Button asChild className="mt-6">
                  <Link href={studioImagesHref({ productId: product.id })}>Run images</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

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
                  Generate RUFUS-ready title, bullets, and keywords — {copyQuote.summary} required.
                </p>
              </div>
              <Button asChild>
                <Link href={studioCopyHref(product.id)}>Generate copy</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {showPublishSections ? (
          <>
            <ProductReadiness
              productId={product.id}
              imageCount={completedAssets.length}
              hasCopy={Boolean(product.listingCopy?.title)}
              grade={product.listingCopy?.grade}
              gradeScore={product.listingCopy?.gradeScore}
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
              marketplaceId={product.marketplace as MarketplaceId}
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
          </>
        ) : (
          <ProductCollapsibleSection
            id="publish-tools"
            title="Export & readiness"
            description="Opens when you have gallery images or listing copy to publish."
            defaultOpen={false}
          >
            <ProductReadiness
              sectionId={false}
              productId={product.id}
              imageCount={completedAssets.length}
              hasCopy={Boolean(product.listingCopy?.title)}
              grade={product.listingCopy?.grade}
              gradeScore={product.listingCopy?.gradeScore}
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
              marketplaceId={product.marketplace as MarketplaceId}
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
          </ProductCollapsibleSection>
        )}

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
    </ProductEditProvider>
  );
}
