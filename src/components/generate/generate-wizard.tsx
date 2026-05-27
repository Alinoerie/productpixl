"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowNotice } from "@/components/ui/workflow-notice";
import { InsufficientCreditsAlert } from "@/components/ui/insufficient-credits-alert";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { useLiveCredits } from "@/hooks/use-live-credits";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { StepRail } from "@/components/studio/step-rail";
import { DropZone } from "@/components/studio/drop-zone";
import { StudioPreview } from "@/components/studio/studio-preview";
import { ModulePreviewPanel } from "@/components/studio/module-preview-panel";
import { useImageStudioStore } from "@/stores/image-studio-store";
import { StudioSuccessBanner } from "@/components/ui/studio-success-banner";
import { ProductIntakeFields } from "@/components/product/product-intake-fields";
import { fetchJson } from "@/lib/fetch-json";
import { EMPTY_PRODUCT_INTAKE, type ProductIntakeData } from "@/lib/product-intake";
import { quoteImageRun, quoteImageModuleBreakdown } from "@/lib/credit-pricing";
import { CreditsRequiredLine } from "@/components/ui/credits-required-line";
import { CreditEstimateBar } from "@/components/studio/credit-estimate-bar";
import { VisionAnalysisCard } from "@/components/studio/vision-analysis-card";
import { MasonryGallery } from "@/components/studio/masonry-gallery";
import type { ProductAnalysis } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { formatPipelinePhase, formatModuleLabel } from "@/lib/status-labels";
import { PipelineProgressBar } from "@/components/ui/pipeline-progress-bar";
import type { PipelineStatusShape } from "@/lib/pipeline-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { Camera, Check, Download, Images, Loader2, Sparkles } from "lucide-react";
import { type MarketplaceId } from "@/lib/marketplaces";
import { getMarketplace } from "@/lib/marketplaces";
import { getVisualTemplate } from "@/lib/templates/catalog";
import { studioCopyHref } from "@/lib/studio-routes";
import { UnsavedNavigationGuard } from "@/hooks/use-unsaved-navigation-guard";
import { PIPELINE_ERROR, SUPPORT_EMAIL, toSellerPipelineError } from "@/lib/pipeline-errors";
import { PipelineErrorMessage } from "@/components/ui/pipeline-error-message";
import { downloadGalleryZip } from "@/lib/download-export-pack";
import {
  DEFAULT_LISTING_MODULE_IDS,
  LISTING_MODULE_LIBRARY,
  type ListingModuleId,
} from "@/pipelines/modules";

interface PromptPlanItem {
  moduleId: string;
  label: string;
  resolution: "2K" | "4K";
  prompt: string;
}

const STEP_RAIL = [
  { id: "plan", label: "Product & plan", icon: Camera },
  { id: "gallery", label: "Gallery", icon: Images },
];

type LinkedProduct = {
  id: string;
  name: string;
  inputImageUrl: string;
  marketplace: MarketplaceId;
  dimensions?: string | null;
  materials?: string | null;
  colors?: string | null;
  keyFeatures?: string | null;
  targetBuyer?: string | null;
  amazonCategory?: string | null;
  competitors?: string | null;
  vibe?: string | null;
  useCase?: string | null;
  differentiators?: string | null;
  referenceImageUrls?: string[] | null;
  brandName?: string;
};

export function GenerateWizard({
  initialCredits,
  linkedProduct = null,
  missingProductId = false,
  defaultBrandName = "",
  templateSlug,
  paymentSuccess = false,
  hidePageHeader = false,
}: {
  initialCredits: number;
  linkedProduct?: LinkedProduct | null;
  missingProductId?: boolean;
  defaultBrandName?: string;
  templateSlug?: string;
  paymentSuccess?: boolean;
  hidePageHeader?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [credits, setCredits] = useLiveCredits(initialCredits);
  const previewUrlRef = useRef<string | null>(null);
  const stepperRef = useRef<HTMLDivElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);
  const [linkedProductId, setLinkedProductId] = useState<string | null>(linkedProduct?.id ?? null);
  const [step, setStep] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedModules, setSelectedModules] = useState<ListingModuleId[]>(DEFAULT_LISTING_MODULE_IDS);
  const [marketplace, setMarketplace] = useState<MarketplaceId>("AMAZON_US");
  const [productId, setProductId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [planningPrompts, setPlanningPrompts] = useState(false);
  const [promptPlan, setPromptPlan] = useState<PromptPlanItem[]>([]);
  const [promptsExpanded, setPromptsExpanded] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatusShape | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [pipelineFailed, setPipelineFailed] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [productRunStatus, setProductRunStatus] = useState<string | null>(null);
  const [queuedStale, setQueuedStale] = useState(false);
  const [savedAnalysis, setSavedAnalysis] = useState<ProductAnalysis | null>(null);
  const [analysisStubMode, setAnalysisStubMode] = useState(false);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [projectListingCopy, setProjectListingCopy] = useState<{
    title: string;
    bullets: string[];
    description?: string | null;
    backendKeywords?: string | null;
  } | null>(null);

  const mobileStickyFooter =
    "sticky bottom-[var(--mobile-nav-offset)] z-10 md:static md:bottom-auto";

  const [form, setForm] = useState<ProductIntakeData>({
    ...EMPTY_PRODUCT_INTAKE,
    brandName: defaultBrandName,
  });

  const intakePayload = useCallback(
    (): ProductIntakeData => ({
      ...form,
      referenceImageUrls,
    }),
    [form, referenceImageUrls]
  );

  const toggleModule = (moduleId: ListingModuleId) => {
    if (moduleId === "L1") return;
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return LISTING_MODULE_LIBRARY.filter((m) => next.has(m.id)).map((m) => m.id);
    });
    setPromptPlan([]);
  };

  const imageQuote = useMemo(
    () =>
      quoteImageRun({
        selectedModules,
        marketplace,
        intake: intakePayload(),
      }),
    [selectedModules, marketplace, intakePayload]
  );

  const imageModuleBreakdown = useMemo(
    () =>
      quoteImageModuleBreakdown({
        selectedModules,
        marketplace,
        intake: intakePayload(),
      }),
    [selectedModules, marketplace, intakePayload]
  );

  const onFile = async (file: File) => {
    setError("");
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setPreview(objectUrl);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { ok, data } = await fetchJson<{ url?: string; error?: string }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const analyze = async () => {
    if (!imageUrl) return;
    setAnalyzing(true);
    setError("");
    try {
      const { ok, data } = await fetchJson<{
        analysis?: ProductAnalysis;
        stubMode?: boolean;
        error?: string;
      }>(
        "/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        }
      );
      if (!ok) throw new Error(data.error || "Analysis failed");
      const a = data.analysis;
      if (!a) throw new Error("No analysis returned");
      setSavedAnalysis(a);
      setAnalysisStubMode(Boolean(data.stubMode));
      setForm((prev) => ({
        ...prev,
        name: a.productName || prev.name,
        brandName: a.brandName || prev.brandName || defaultBrandName,
        category: a.amazonCategory || prev.category,
        dimensions: a.dimensions || prev.dimensions,
        materials: a.materials || prev.materials,
        colors: a.colors || prev.colors,
        keyFeatures: a.keyObservations || prev.keyFeatures,
        targetBuyer: a.suggestedTargetBuyer || prev.targetBuyer,
        useCase: a.useCase || prev.useCase,
        differentiators: a.differentiators || prev.differentiators,
        vibe: a.mood || prev.vibe,
      }));
      setPromptPlan([]);
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!linkedProduct) return;
    setLinkedProductId(linkedProduct.id);
    setMarketplace(linkedProduct.marketplace);
    setForm({
      name: linkedProduct.name,
      brandName: linkedProduct.brandName ?? defaultBrandName,
      category: linkedProduct.amazonCategory ?? "",
      dimensions: linkedProduct.dimensions ?? "",
      materials: linkedProduct.materials ?? "",
      colors: linkedProduct.colors ?? "",
      keyFeatures: linkedProduct.keyFeatures ?? "",
      targetBuyer: linkedProduct.targetBuyer ?? "",
      competitors: linkedProduct.competitors ?? "",
      vibe: linkedProduct.vibe ?? "",
      useCase: linkedProduct.useCase ?? "",
      differentiators: linkedProduct.differentiators ?? "",
      referenceImageUrls: linkedProduct.referenceImageUrls ?? [],
    });
    setReferenceImageUrls(linkedProduct.referenceImageUrls ?? []);
    if (linkedProduct.inputImageUrl) {
      setImageUrl(linkedProduct.inputImageUrl);
      setPreview(linkedProduct.inputImageUrl);
      setStep(1);
    } else {
      setStep(1);
    }
  }, [linkedProduct, defaultBrandName]);

  const copyOnlyHandoff = Boolean(linkedProduct && !linkedProduct.inputImageUrl);

  const buildPromptPlan = useCallback(async () => {
    setError("");
    setPlanningPrompts(true);
    try {
      const { ok, data } = await fetchJson<{
        prompts?: PromptPlanItem[];
        error?: string;
      }>("/api/generate/images/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputImageUrl: imageUrl,
          selectedModules,
          marketplace,
          productData: intakePayload(),
          analysis: savedAnalysis ?? undefined,
          templateSlug,
        }),
      });
      if (!ok) throw new Error(data.error || "Failed to build prompt plan");
      setPromptPlan(data.prompts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build prompt plan");
    } finally {
      setPlanningPrompts(false);
    }
  }, [imageUrl, selectedModules, marketplace, intakePayload, savedAnalysis]);

  useEffect(() => {
    if (step !== 2 || promptPlan.length || planningPrompts || !imageUrl) return;
    void buildPromptPlan();
  }, [step, promptPlan.length, planningPrompts, imageUrl, buildPromptPlan]);

  const startGeneration = async () => {
    if (!promptPlan.length) {
      setError("Generate prompt plan first so you can review/edit prompts.");
      return;
    }
    setError("");
    try {
      const { ok, status, data } = await fetchJson<{
        productId?: string;
        error?: string;
        code?: string;
      }>("/api/generate/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            existingProductId: productId ?? linkedProductId ?? undefined,
            inputImageUrl: imageUrl,
            selectedModules,
            marketplace,
            productData: intakePayload(),
            analysis: savedAnalysis ?? undefined,
            templateSlug,
            promptOverrides: Object.fromEntries(promptPlan.map((p) => [p.moduleId, p.prompt])),
          }),
        }
      );
      if (status === 402) {
        throw new Error("INSUFFICIENT_CREDITS");
      }
      if (status === 503 && data.code === "INNGEST_NOT_CONFIGURED") {
        throw new Error(PIPELINE_ERROR.notConfigured);
      }
      if (!ok) throw new Error(toSellerPipelineError(data.error || PIPELINE_ERROR.generationFailed));
      setProductId(data.productId ?? linkedProductId ?? null);
      setPipelineFailed(false);
      setPollTimedOut(false);
      setProjectListingCopy(null);
      setStep(3);
      window.dispatchEvent(new Event("credits-updated"));
    } catch (e) {
      const raw = e instanceof Error ? e.message : PIPELINE_ERROR.generationFailed;
      const msg = raw === "INSUFFICIENT_CREDITS" ? "INSUFFICIENT_CREDITS" : toSellerPipelineError(raw);
      setError(msg);
    }
  };

  const retryGeneration = async () => {
    setPipelineFailed(false);
    setPollTimedOut(false);
    setPipelineStatus(null);
    setError("");
    await startGeneration();
  };

  const pollStatus = useCallback(async () => {
    if (!productId) return null;
    const { ok, data } = await fetchJson<{
      pipelineStatus?: typeof pipelineStatus;
      status?: string;
      queuedStale?: boolean;
    }>(`/api/products/${productId}/status`);
    if (!ok) return null;
    setPipelineStatus(data.pipelineStatus as typeof pipelineStatus);
    setProductRunStatus(data.status ?? null);
    setQueuedStale(Boolean(data.queuedStale));
    return data.status ?? null;
  }, [productId]);

  useEffect(() => {
    if (step !== 3 || !productId) return;

    let stopped = false;
    let attempts = 0;

    const check = async () => {
      if (stopped) return;
      attempts += 1;
      if (attempts > 240) {
        stopped = true;
        setPollTimedOut(true);
        setError(PIPELINE_ERROR.generationTimedOut);
        toast("Generation is taking longer than expected", "error");
        return;
      }
      const status = await pollStatus();
      if (!status || (status !== "COMPLETE" && status !== "FAILED")) return;

      stopped = true;
      if (status === "FAILED") {
        setPipelineFailed(true);
        toast("Generation failed", "error");
      } else {
        toast("Gallery generation complete");
        completionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      router.refresh();
    };

    void check();
    const id = window.setInterval(() => void check(), 2000);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [step, productId, pollStatus, router, toast]);

  useEffect(() => {
    if (!pipelineFailed && !pollTimedOut) return;
    requestAnimationFrame(() => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      failedRef.current?.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
    });
  }, [pipelineFailed, pollTimedOut]);

  useEffect(() => {
    if (!productId || pipelineStatus?.phase !== "COMPLETE") return;
    void fetchJson<{
      listingCopy?: {
        title?: string;
        bullets?: string[];
        description?: string | null;
        backendKeywords?: string | null;
      };
    }>(`/api/products/${productId}/status`).then(({ data }) => {
      if (!data.listingCopy?.title) return;
      setProjectListingCopy({
        title: data.listingCopy.title,
        bullets: (data.listingCopy.bullets as string[]) ?? [],
        description: data.listingCopy.description,
        backendKeywords: data.listingCopy.backendKeywords,
      });
    });
  }, [productId, pipelineStatus?.phase]);

  useEffect(() => {
    stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const done = pipelineStatus?.phase === "COMPLETE";
  const pipelineRunning =
    step === 3 &&
    Boolean(pipelineStatus?.phase) &&
    pipelineStatus?.phase !== "COMPLETE" &&
    pipelineStatus?.phase !== "FAILED" &&
    !pipelineFailed;
  const formInProgress = step >= 1 && step <= 2;
  const navigationBlocked = uploading || analyzing || planningPrompts || formInProgress || pipelineRunning;
  const lacksCredits = credits < imageQuote.total;
  const resultsLoading = step === 3 && !pipelineStatus?.steps?.length && !pipelineFailed;
  const galleryAssets =
    pipelineStatus?.steps?.map((s) => ({
      id: s.id,
      moduleId: s.id,
      imageUrl: s.imageUrl ?? null,
      qaScore: s.qaScore ?? null,
      status: s.imageUrl ? "COMPLETE" : s.status,
    })) ?? [];
  const completedImages = galleryAssets.filter((a) => a.imageUrl);

  const resetWizard = useCallback((mode: "prompt" | "fresh") => {
    setPipelineFailed(false);
    setPollTimedOut(false);
    setProjectListingCopy(null);
    setPipelineStatus(null);
    setError("");
    setDownloading(false);
    if (mode === "fresh") {
      setProductId(null);
      setLinkedProductId(null);
      setStep(0);
      setPromptPlan([]);
      setImageUrl("");
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreview("");
      setForm({ ...EMPTY_PRODUCT_INTAKE, brandName: defaultBrandName });
      setReferenceImageUrls([]);
      setSavedAnalysis(null);
      setAnalysisStubMode(false);
    } else {
      setStep(2);
    }
  }, [defaultBrandName]);

  const downloadImages = async () => {
    setDownloading(true);
    try {
      const slug = form.name.replace(/\s+/g, "-").toLowerCase() || "product";
      const items = completedImages
        .filter((asset): asset is typeof asset & { imageUrl: string } => Boolean(asset.imageUrl))
        .map((asset) => ({ moduleId: asset.moduleId, imageUrl: asset.imageUrl }));
      const saved = await downloadGalleryZip(items, slug);
      toast(`Downloaded ${slug}-gallery.zip (${saved} image${saved === 1 ? "" : "s"})`);
    } catch {
      toast("Download failed — open images individually or try again", "error");
    } finally {
      setDownloading(false);
    }
  };

  const PHASES = ["RECEIVING", "ANALYZING", "RESEARCHING", "SELECTING", "GENERATING", "QA", "COMPLETE"];
  const marketplaceLabel = getMarketplace(marketplace).label;
  const moduleSummary = selectedModules.map((id) => formatModuleLabel(id)).join(" · ");
  const template = templateSlug ? getVisualTemplate(templateSlug) : undefined;
  const railIndex = step >= 3 ? 1 : 0;
  const setImagePreview = useImageStudioStore((s) => s.setPreviewUrl);
  const setImageCreditTotal = useImageStudioStore((s) => s.setCreditTotal);

  useEffect(() => {
    setImagePreview(preview);
    setImageCreditTotal(imageQuote.total);
  }, [preview, imageQuote.total, setImagePreview, setImageCreditTotal]);

  return (
    <div className="space-y-8">
      <WorkflowNotice
        initialCredits={credits}
        creditsRequired={imageQuote.total}
        detailLine={imageQuote.detailLine}
        description="Credits are quoted below. Nothing generates until you tap Start generation on your plan."
      />

      {template ? (
        <p className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-soft)]/40 px-4 py-3 text-sm">
          Visual template <strong>{template.title}</strong> selected — prompts will follow this layout with your brand palette.
        </p>
      ) : null}

      {paymentSuccess ? (
        <Suspense fallback={null}>
          <PaymentSuccessBanner onCreditsUpdated={setCredits} />
        </Suspense>
      ) : null}

      {!hidePageHeader ? (
        <PageHeader
          eyebrow="Image studio"
          title="Image studio"
          description={
            <>
              {moduleSummary} —{" "}
              <CreditsRequiredLine total={imageQuote.total} detailLine={imageQuote.detailLine} />
            </>
          }
        />
      ) : (
        <p className="text-sm text-[var(--muted-fg)]">
          {moduleSummary} —{" "}
          <CreditsRequiredLine total={imageQuote.total} detailLine={imageQuote.detailLine} />
        </p>
      )}

      <div id="studio-steps" ref={stepperRef} className="scroll-mt-24">
        <StepRail steps={STEP_RAIL} currentIndex={railIndex} />
      </div>

      {missingProductId ? (
        <p className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
          That project link is invalid or no longer exists. Start a new run below or return to{" "}
          <Link href="/projects" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            all projects
          </Link>
          .
        </p>
      ) : null}

      {linkedProduct ? (
        <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-soft)]/40 px-4 py-3 text-sm">
          {copyOnlyHandoff ? (
            <>
              Listing copy saved for <strong>{linkedProduct.name}</strong> — upload a product photo below to
              generate gallery images. Product details are already filled in.
            </>
          ) : (
            <>
              Continuing run for <strong>{linkedProduct.name}</strong> — product photo and details are pre-filled.
            </>
          )}
        </div>
      ) : null}

      {error === "INSUFFICIENT_CREDITS" ? (
        <InsufficientCreditsAlert required={imageQuote.total} available={credits} />
      ) : null}

      {error && error !== "INSUFFICIENT_CREDITS" && step !== 0 && step !== 2 ? (
        <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
          <PipelineErrorMessage
            message={toSellerPipelineError(error)}
            supportSubject="ProductPixl image generation issue"
          />
        </div>
      ) : null}

      <div className={cn("grid gap-8", step < 3 && "xl:grid-cols-[minmax(0,1fr)_320px]")}>
        <div className="min-w-0 space-y-8">

      {step === 0 && (
        <Card className="overflow-hidden shadow-[var(--shadow-md)]">
          <CardContent className="space-y-6 p-6 md:p-8">
            <DropZone
              preview={preview}
              dragOver={dragOver}
              scanning={analyzing}
              disabled={uploading || analyzing}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file?.type.startsWith("image/")) onFile(file);
              }}
              onFileSelect={onFile}
              onClear={() => {
                if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
                setPreview("");
                setImageUrl("");
              }}
              emptyTitle="Drop your product photo"
              emptyHint="JPG, PNG or WEBP · max 20MB · No ASIN needed"
              inputId="generate-upload"
            />
            {error && error !== "INSUFFICIENT_CREDITS" ? (
              <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
                <PipelineErrorMessage
                  message={toSellerPipelineError(error)}
                  supportSubject="ProductPixl image generation issue"
                />
                {imageUrl ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-3 border-[var(--error-border)]"
                    disabled={analyzing || uploading}
                    onClick={() => {
                      setError("");
                      void analyze();
                    }}
                  >
                    Try again
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div className={cn(mobileStickyFooter, "-mx-6 -mb-6 border-t border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur-sm md:mx-0 md:mb-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none")}>
              <Button
                onClick={analyze}
                disabled={!imageUrl || uploading || analyzing}
                className="h-12 w-full rounded-xl text-base"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                  </>
                ) : analyzing ? (
                  <>
                    <Sparkles className="h-4 w-4" /> Analyzing with vision AI…
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" /> Analyze & continue
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="shadow-[var(--shadow-md)]">
          <CardContent className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
            <p className="md:col-span-2 text-sm text-[var(--muted-fg)]">
              {copyOnlyHandoff && !imageUrl
                ? "Review saved product details, upload a photo, then continue to the prompt plan."
                : "Review AI-extracted product data and add vibe, use case, and reference images — this shapes your gallery prompts."}
            </p>
            {analysisStubMode ? (
              <p className="md:col-span-2 rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
                Vision AI is in demo mode — add a Replicate API token for live analysis, or fill in product details manually.
              </p>
            ) : null}
            {!imageUrl ? (
              <div className="md:col-span-2 space-y-2 rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)]/40 p-4">
                <Label htmlFor="generate-upload-step1">Product photo (required for gallery)</Label>
                <UploadDropzone
                  preview={preview}
                  previewAlt="Product photo preview"
                  dragOver={dragOver}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file?.type.startsWith("image/")) onFile(file);
                  }}
                  onFileSelect={onFile}
                  onClear={() => {
                    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                    previewUrlRef.current = null;
                    setPreview("");
                    setImageUrl("");
                  }}
                  disabled={uploading || analyzing}
                  minHeight="min-h-[180px]"
                  emptyHint="Upload a product photo to start generating images"
                  inputId="generate-upload-step1"
                />
                {uploading ? (
                  <p className="text-xs text-[var(--muted-fg)]">Uploading photo…</p>
                ) : null}
              </div>
            ) : null}
            {savedAnalysis ? (
              <div className="md:col-span-2">
                <VisionAnalysisCard analysis={savedAnalysis} />
              </div>
            ) : null}
            <ProductIntakeFields
              form={form}
              onChange={setForm}
              marketplace={marketplace}
              onMarketplaceChange={(id) => {
                setMarketplace(id);
                setPromptPlan([]);
              }}
              referenceImageUrls={referenceImageUrls}
              onReferenceImagesChange={setReferenceImageUrls}
              variant="images"
              disabled={uploading || analyzing}
            />
            <div className={cn(mobileStickyFooter, "-mx-6 flex gap-3 border-t border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur-sm md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none md:col-span-2")}>
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setPromptPlan([]);
                  setStep(2);
                }}
                disabled={!form.name.trim() || !form.category.trim() || !imageUrl || uploading}
              >
                {imageUrl ? "Next" : "Upload photo to continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="shadow-[var(--shadow-md)]">
          <CardContent className="space-y-6 p-6 md:p-8">
            {imageUrl ? (
              <div className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Original product reference"
                  className="h-24 w-24 shrink-0 rounded-lg border border-[var(--border)] bg-white object-contain"
                />
                <div>
                  <p className="font-medium">Original product photo</p>
                  <p className="mt-1 text-sm text-[var(--muted-fg)]">
                    Every gallery module is generated from this reference — the product stays intact; prompts only change scene, lighting, and context.
                  </p>
                </div>
              </div>
            ) : null}
            <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-sm">
              Marketplace: <strong>{marketplaceLabel}</strong> — change on the product info step if needed.
            </p>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">Listing modules</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedModules(DEFAULT_LISTING_MODULE_IDS);
                      setPromptPlan([]);
                    }}
                  >
                    Starter (3)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedModules(LISTING_MODULE_LIBRARY.map((m) => m.id));
                      setPromptPlan([]);
                    }}
                  >
                    Full library (12)
                  </Button>
                </div>
              </div>
              <p className="text-sm text-[var(--muted-fg)]">
                Hero (L1) is always included. Add optional modules from the full PHOILA L1–L12 library — credits update as you select.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {LISTING_MODULE_LIBRARY.map((mod) => {
                  const checked = selectedModules.includes(mod.id);
                  const locked = mod.id === "L1";
                  return (
                    <label
                      key={mod.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                        checked ? "border-[var(--accent)]/40 bg-[var(--card)]" : "border-[var(--border)]/80 bg-[var(--background)]",
                        locked && "cursor-default opacity-90"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        disabled={locked}
                        onChange={() => toggleModule(mod.id)}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {mod.label}
                          {mod.optional ? null : <span className="ml-1 text-xs text-[var(--muted-fg)]">(core)</span>}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted-fg)]">{mod.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                Built from your product analysis and category research
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                Prompts tuned for marketplace listing rules and your brand
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                Edit prompt text before any image2image call is sent
              </li>
            </ul>
            {error && error !== "INSUFFICIENT_CREDITS" ? (
              <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
                <PipelineErrorMessage
                  message={toSellerPipelineError(error)}
                  supportSubject="ProductPixl image generation issue"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3 border-[var(--error-border)]"
                  disabled={planningPrompts || !imageUrl}
                  onClick={() => {
                    setError("");
                    void buildPromptPlan();
                  }}
                >
                  Retry prompt plan
                </Button>
              </div>
            ) : null}
            <div className="space-y-3">
              {planningPrompts && promptPlan.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-sm text-[var(--muted-fg)]">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Building your image plan from your photo and brand kit…
                </div>
              ) : null}
              {promptPlan.length > 0 ? (
                <div className="space-y-4 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">Ready to generate</p>
                      <p className="mt-1 text-sm text-[var(--muted-fg)]">
                        {promptPlan.length} images · {moduleSummary} · {marketplaceLabel} ·{" "}
                        {imageQuote.total.toLocaleString()} credits
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPromptsExpanded((v) => !v)}
                    >
                      {promptsExpanded ? "Hide prompts" : "Review & edit prompts"}
                    </Button>
                  </div>
                  {promptsExpanded ? (
                    <div className="space-y-4 border-t border-[var(--border)] pt-4">
                      {promptPlan.map((item, index) => (
                        <div key={item.moduleId} className="space-y-2 rounded-lg border bg-[var(--card)] p-3">
                          <p className="text-sm font-semibold">
                            {index + 1}. {formatModuleLabel(item.moduleId)}
                            {item.label ? ` · ${item.label}` : ""}
                          </p>
                          <Textarea
                            className="min-h-[140px] text-xs leading-relaxed"
                            value={item.prompt}
                            onChange={(e) =>
                              setPromptPlan((prev) =>
                                prev.map((p) =>
                                  p.moduleId === item.moduleId ? { ...p, prompt: e.target.value } : p
                                )
                              )
                            }
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPromptPlan([]);
                          void buildPromptPlan();
                        }}
                        disabled={planningPrompts}
                      >
                        Rebuild plan from product details
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : !planningPrompts ? (
                <Button variant="outline" className="w-full" onClick={buildPromptPlan} disabled={!imageUrl}>
                  Build image plan
                </Button>
              ) : null}
            </div>
            <div className={cn(mobileStickyFooter, "-mx-6 flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur-sm md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none")}>
              <Button variant="outline" onClick={() => setStep(1)} className="self-start">
                Back
              </Button>
              <CreditEstimateBar
                modules={imageModuleBreakdown}
                total={imageQuote.total}
                caveat={imageQuote.detailLine}
                ctaLabel={
                  lacksCredits
                    ? "Need credits to start"
                    : `Start generation (${imageQuote.total.toLocaleString()} credits)`
                }
                onCta={startGeneration}
                disabled={!promptPlan.length || planningPrompts || lacksCredits}
                loading={planningPrompts}
                loadingLabel="Building plan…"
              />
            </div>
          </CardContent>
        </Card>
      )}

        </div>

        {step < 3 ? (
          <StudioPreview title="Module preview">
            <ModulePreviewPanel previewUrl={preview} outputs={completedImages.length ? galleryAssets : undefined} />
          </StudioPreview>
        ) : null}
      </div>

      {step === 3 && (
        <div className="space-y-6">
          <p className="sr-only" aria-live="polite">
            {pipelineFailed ? "Image generation failed" : pollTimedOut ? "Image generation timed out" : ""}
          </p>
          {pipelineFailed || pollTimedOut ? (
            <div
              ref={failedRef}
              role="alert"
              className="scroll-mt-24 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-4 text-sm text-[var(--error)]"
            >
              <p className="font-medium text-[var(--foreground)]">
                {pollTimedOut ? "Taking longer than expected" : "Generation didn't finish"}
              </p>
              <p className="mt-2 text-[var(--error)]">
                {pollTimedOut
                  ? PIPELINE_ERROR.generationTimedOut
                  : toSellerPipelineError(pipelineStatus?.error ?? PIPELINE_ERROR.generationFailed)}
              </p>
              <p className="mt-2">
                <Link
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("ProductPixl image generation issue")}`}
                  className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  Contact support
                </Link>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" disabled={!promptPlan.length || lacksCredits} onClick={() => void retryGeneration()}>
                  Retry generation
                </Button>
                {productId ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/products/${productId}`}>Open project</Link>
                  </Button>
                ) : null}
                <Button type="button" size="sm" variant="outline" onClick={() => resetWizard("prompt")}>
                  Edit prompt plan
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => resetWizard("fresh")}>
                  Start fresh
                </Button>
              </div>
            </div>
          ) : null}
          <Card className="border-[var(--accent)]/20 bg-[var(--accent-soft)]/30">
            <CardContent className="space-y-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Generation progress
              </p>
              <PipelineProgressBar
                status={productRunStatus ?? (pipelineStatus?.phase ? "PROCESSING" : "QUEUED")}
                pipelineStatus={pipelineStatus as PipelineStatusShape | null}
                queuedStale={queuedStale}
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2" aria-label="Generation phases">
            {PHASES.map((ph) => {
              const current = pipelineStatus?.phase;
              const idx = PHASES.indexOf(current ?? "");
              const phIdx = PHASES.indexOf(ph);
              const state =
                ph === "COMPLETE" && done
                  ? "done"
                  : phIdx < idx
                    ? "done"
                    : ph === current
                      ? "active"
                      : "pending";
              return (
                <span
                  key={ph}
                  title={ph}
                  aria-current={state === "active" ? "step" : undefined}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    state === "done" && "bg-[var(--success-bg)] text-[var(--success)]",
                    state === "active" && "bg-[var(--accent)] text-white animate-pulse-soft",
                    state === "pending" && "bg-[var(--muted)] text-[var(--muted-fg)]"
                  )}
                >
                  {formatPipelinePhase(ph)}
                </span>
              );
            })}
          </div>

          {resultsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {(promptPlan.length ? promptPlan : [{ moduleId: "L1" }, { moduleId: "L3" }, { moduleId: "L4" }]).map(
                (item) => (
                  <Card key={item.moduleId} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Skeleton className="aspect-square w-full rounded-none" />
                      <div className="space-y-2 p-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          ) : pipelineStatus?.steps?.length ? (
            <>
              {completedImages.length > 0 ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <p className="text-sm font-medium">
                    {completedImages.length} of {galleryAssets.length} images ready
                  </p>
                  <Button type="button" variant="outline" size="sm" disabled={downloading} onClick={downloadImages}>
                    {downloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download gallery.zip ({completedImages.length})
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
              <MasonryGallery assets={galleryAssets} />
            </>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {done ? "Gallery complete" : ""}
          </p>
          {done && productId && (
            <StudioSuccessBanner
              innerRef={completionRef}
              title="Gallery complete — finish your listing"
              description="Download images, write copy, grade, and export from your project hub."
            >
              <Button size="lg" className="rounded-xl" onClick={() => router.push(`/products/${productId}`)}>
                View full project
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href={studioCopyHref(productId)}>Generate listing copy</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href={`/products/${productId}#export`}>Export hub</Link>
              </Button>
              {projectListingCopy?.title ? (
                <GradeListingButton
                  listingCopy={{
                    title: projectListingCopy.title,
                    bullets: projectListingCopy.bullets,
                    description: projectListingCopy.description ?? undefined,
                    backendKeywords: projectListingCopy.backendKeywords ?? undefined,
                    productId,
                  }}
                  productId={productId}
                  size="lg"
                  variant="outline"
                  className="rounded-xl"
                >
                  Grade listing copy
                </GradeListingButton>
              ) : (
                <Button asChild size="lg" variant="outline" className="rounded-xl">
                  <Link href="/grader">Grade listing copy</Link>
                </Button>
              )}
            </StudioSuccessBanner>
          )}
        </div>
      )}

      <UnsavedNavigationGuard
        enabled={navigationBlocked}
        title={pipelineRunning ? "Generation in progress" : "Leave image studio?"}
        description={
          pipelineRunning
            ? "Your gallery is still generating. You can leave safely — check the project page for results."
            : "You have progress in this run. Leaving now will discard unsaved steps."
        }
      />
    </div>
  );
}
