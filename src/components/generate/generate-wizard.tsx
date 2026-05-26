"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowNotice } from "@/components/ui/workflow-notice";
import { InsufficientCreditsAlert } from "@/components/ui/insufficient-credits-alert";
import { BrandSetupNudge } from "@/components/ui/brand-setup-nudge";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { useLiveCredits } from "@/hooks/use-live-credits";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { MarketplacePicker } from "@/components/ui/marketplace-picker";
import { MarketplaceGuidance } from "@/components/ui/marketplace-guidance";
import { StudioStepper } from "@/components/ui/studio-stepper";
import { fetchJson } from "@/lib/fetch-json";
import { cn } from "@/lib/utils";
import { formatPipelinePhase, formatModuleLabel } from "@/lib/status-labels";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { Camera, Check, Download, Loader2, Sparkles } from "lucide-react";
import { type MarketplaceId } from "@/lib/marketplaces";
import { getMarketplace } from "@/lib/marketplaces";
import { downloadGalleryZip } from "@/lib/download-gallery-zip";
import { UnsavedNavigationGuard } from "@/hooks/use-unsaved-navigation-guard";

interface ProductData {
  name: string;
  brandName: string;
  category: string;
  dimensions: string;
  materials: string;
  colors: string;
  keyFeatures: string;
  targetBuyer: string;
}

interface ProductAnalysis {
  productName?: string;
  brandName?: string;
  amazonCategory?: string;
  dimensions?: string;
  materials?: string;
  colors?: string;
  keyObservations?: string;
}

interface PromptPlanItem {
  moduleId: string;
  label: string;
  resolution: "2K" | "4K";
  prompt: string;
}

const STEPS = ["Upload", "Product info", "Prompt plan", "Results"];

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
  brandName?: string;
};

export function GenerateWizard({
  initialCredits,
  linkedProduct = null,
  missingProductId = false,
  brandConfigured = true,
  paymentSuccess = false,
}: {
  initialCredits: number;
  linkedProduct?: LinkedProduct | null;
  missingProductId?: boolean;
  brandConfigured?: boolean;
  paymentSuccess?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [credits, setCredits] = useLiveCredits(initialCredits);
  const previewUrlRef = useRef<string | null>(null);
  const stepperRef = useRef<HTMLDivElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const [linkedProductId, setLinkedProductId] = useState<string | null>(linkedProduct?.id ?? null);
  const [step, setStep] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [includePackaging, setIncludePackaging] = useState(false);
  const [marketplace, setMarketplace] = useState<MarketplaceId>("AMAZON_US");
  const [productId, setProductId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [planningPrompts, setPlanningPrompts] = useState(false);
  const [promptPlan, setPromptPlan] = useState<PromptPlanItem[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState<{
    phase: string;
    steps: {
      id: string;
      label: string;
      status: string;
      imageUrl?: string;
      qaScore?: number;
      prompt?: string;
    }[];
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [pipelineFailed, setPipelineFailed] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [projectListingCopy, setProjectListingCopy] = useState<{
    title: string;
    bullets: string[];
    description?: string | null;
    backendKeywords?: string | null;
  } | null>(null);

  const mobileStickyFooter =
    "sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-10 md:static md:bottom-auto";

  const [form, setForm] = useState<ProductData>({
    name: "",
    brandName: "",
    category: "",
    dimensions: "",
    materials: "",
    colors: "",
    keyFeatures: "",
    targetBuyer: "",
  });

  const setField = (key: keyof ProductData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

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
      const { ok, data } = await fetchJson<{ analysis?: ProductAnalysis; error?: string }>(
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
      setForm({
        name: a.productName || form.name,
        brandName: a.brandName || form.brandName,
        category: a.amazonCategory || form.category,
        dimensions: a.dimensions || form.dimensions,
        materials: a.materials || form.materials,
        colors: a.colors || form.colors,
        keyFeatures: a.keyObservations || form.keyFeatures,
        targetBuyer: form.targetBuyer,
      });
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
      brandName: linkedProduct.brandName ?? "",
      category: linkedProduct.amazonCategory ?? "",
      dimensions: linkedProduct.dimensions ?? "",
      materials: linkedProduct.materials ?? "",
      colors: linkedProduct.colors ?? "",
      keyFeatures: linkedProduct.keyFeatures ?? "",
      targetBuyer: linkedProduct.targetBuyer ?? "",
    });
    if (linkedProduct.inputImageUrl) {
      setImageUrl(linkedProduct.inputImageUrl);
      setPreview(linkedProduct.inputImageUrl);
      setStep(1);
    } else {
      setStep(1);
    }
  }, [linkedProduct]);

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
          includePackaging,
          marketplace,
          productData: form,
        }),
      });
      if (!ok) throw new Error(data.error || "Failed to build prompt plan");
      setPromptPlan(data.prompts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build prompt plan");
    } finally {
      setPlanningPrompts(false);
    }
  }, [imageUrl, includePackaging, marketplace, form]);

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
      const { ok, status, data } = await fetchJson<{ productId?: string; error?: string }>(
        "/api/generate/images",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            existingProductId: linkedProductId ?? undefined,
            inputImageUrl: imageUrl,
            includePackaging,
            marketplace,
            productData: form,
            promptOverrides: Object.fromEntries(promptPlan.map((p) => [p.moduleId, p.prompt])),
          }),
        }
      );
      if (status === 402) {
        throw new Error("INSUFFICIENT_CREDITS");
      }
      if (!ok) throw new Error(data.error || "Failed to start");
      setProductId(data.productId ?? linkedProductId ?? null);
      setPipelineFailed(false);
      setPollTimedOut(false);
      setProjectListingCopy(null);
      setStep(3);
      window.dispatchEvent(new Event("credits-updated"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg === "INSUFFICIENT_CREDITS" ? "INSUFFICIENT_CREDITS" : msg);
    }
  };

  const pollStatus = useCallback(async () => {
    if (!productId) return null;
    const { ok, data } = await fetchJson<{
      pipelineStatus?: typeof pipelineStatus;
      status?: string;
    }>(`/api/products/${productId}/status`);
    if (!ok) return null;
    setPipelineStatus(data.pipelineStatus as typeof pipelineStatus);
    return data.status ?? null;
  }, [productId]);

  useEffect(() => {
    if (step !== 3 || !productId) return;

    let stopped = false;
    let attempts = 0;

    const check = async () => {
      if (stopped) return;
      attempts += 1;
      if (attempts > 90) {
        stopped = true;
        setPollTimedOut(true);
        setError("Generation timed out. Open your project page or retry your prompt plan.");
        toast("Generation timed out", "error");
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
  const lacksCredits = credits < 1;
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
      setForm({
        name: "",
        brandName: "",
        category: "",
        dimensions: "",
        materials: "",
        colors: "",
        keyFeatures: "",
        targetBuyer: "",
      });
    } else {
      setStep(2);
    }
  }, []);

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
  const categoryLabel = `${marketplaceLabel} category`;

  return (
    <div className="space-y-8">
      <WorkflowNotice
        initialCredits={credits}
        description="PHOILA image pipeline — review prompts before any image is generated."
      />

      {paymentSuccess ? (
        <Suspense fallback={null}>
          <PaymentSuccessBanner onCreditsUpdated={setCredits} />
        </Suspense>
      ) : null}

      <BrandSetupNudge configured={brandConfigured} />

      <PageHeader
        eyebrow="PHOILA pipeline"
        title="Image studio"
        description={
          <>
            L1 hero · L3 lifestyle · L4 detail
            {includePackaging ? " · L8 packaging" : ""} —{" "}
            <strong className="text-[var(--foreground)]">1 credit</strong>
          </>
        }
      />

      <div ref={stepperRef}>
        <StudioStepper steps={STEPS} currentStep={step} label="Generation progress" />
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

      {error === "INSUFFICIENT_CREDITS" ? <InsufficientCreditsAlert /> : null}

      {error && error !== "INSUFFICIENT_CREDITS" && step !== 0 && step !== 2 ? (
        <p className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">{error}</p>
      ) : null}

      {step === 0 && (
        <Card className="overflow-hidden shadow-[var(--shadow-md)]">
          <CardContent className="space-y-6 p-6 md:p-8">
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
              minHeight="min-h-[280px]"
              emptyTitle="Drop your product photo"
              emptyHint="JPG, PNG or WEBP · max 20MB · No ASIN needed"
              inputId="generate-upload"
            />
            {error && error !== "INSUFFICIENT_CREDITS" ? (
              <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
                <p>{error}</p>
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
                : "Review AI-extracted product data. Edit anything before generation — this feeds your PHOILA prompts."}
            </p>
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
                  emptyHint="PHOILA needs a product photo to generate images"
                  inputId="generate-upload-step1"
                />
                {uploading ? (
                  <p className="text-xs text-[var(--muted-fg)]">Uploading photo…</p>
                ) : null}
              </div>
            ) : null}
            <div className="md:col-span-2">
              <Label className="mb-2 block">Marketplace</Label>
              <MarketplacePicker
                value={marketplace}
                onChange={(id) => {
                  setMarketplace(id);
                  setPromptPlan([]);
                }}
                noteField="imageNote"
                name="generate-marketplace-step1"
              />
              <div className="mt-3">
                <MarketplaceGuidance marketplaceId={marketplace} variant="images" />
              </div>
            </div>
            {(
              [
                ["name", "Product name"],
                ["brandName", "Brand name"],
                ["category", categoryLabel],
                ["dimensions", "Dimensions"],
                ["materials", "Materials"],
                ["colors", "Colors"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={`generate-${key}`}>{label}</Label>
                <Input
                  id={`generate-${key}`}
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label htmlFor="generate-features">Key features</Label>
              <Textarea
                id="generate-features"
                value={form.keyFeatures}
                onChange={(e) => setField("keyFeatures", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="generate-buyer">Target buyer</Label>
              <Input
                id="generate-buyer"
                value={form.targetBuyer}
                onChange={(e) => setField("targetBuyer", e.target.value)}
              />
            </div>
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
                disabled={!form.name.trim() || !imageUrl || uploading}
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
            <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-sm">
              Marketplace: <strong>{marketplaceLabel}</strong> — change on the product info step if needed.
            </p>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={includePackaging}
                  onChange={(e) => {
                    setIncludePackaging(e.target.checked);
                    setPromptPlan([]);
                  }}
                />
                <div>
                  <p className="font-medium">Include L8 packaging module</p>
                  <p className="mt-1 text-sm text-[var(--muted-fg)]">
                    Adds unboxing / pack shot — longer generation time
                  </p>
                </div>
              </label>
            </div>
            <ul className="space-y-2 text-sm text-[var(--muted-fg)]">
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                Step 2 + 3 pipeline context (analysis + category research)
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                Prompts structured from PHOILA listing pipeline constraints
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                Edit prompt text before any image2image call is sent
              </li>
            </ul>
            {error && error !== "INSUFFICIENT_CREDITS" ? (
              <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
                <p>{error}</p>
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
              <Button
                variant="outline"
                className="w-full"
                onClick={buildPromptPlan}
                disabled={planningPrompts || !imageUrl}
              >
                {planningPrompts ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building prompt plan…
                  </>
                ) : (
                  "Generate prompt plan"
                )}
              </Button>
              {planningPrompts && promptPlan.length === 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
                  ))}
                </div>
              ) : null}
              {promptPlan.length > 0 && (
                <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <p className="text-sm font-medium">
                    Prompt plan ready — edit anything below before generation:
                  </p>
                  {promptPlan.map((item, index) => (
                    <div key={item.moduleId} className="space-y-2 rounded-lg border bg-[var(--card)] p-3">
                      <p className="text-sm font-semibold">
                        {index + 1}. {formatModuleLabel(item.moduleId)}
                        {item.label ? ` · ${item.label}` : ""} ({item.resolution})
                      </p>
                      <Textarea
                        className="min-h-[220px] text-xs leading-relaxed"
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
                </div>
              )}
            </div>
            <div className={cn(mobileStickyFooter, "-mx-6 flex gap-3 border-t border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur-sm md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none")}>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={startGeneration}
                className="flex-1 rounded-xl"
                size="lg"
                disabled={!promptPlan.length || planningPrompts || lacksCredits}
              >
                {lacksCredits ? "Need credits to start" : "Start generation with reviewed prompts (1 credit)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {pipelineFailed || pollTimedOut ? (
            <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-4 text-sm text-[var(--error)]">
              <p>
                {pollTimedOut
                  ? "Generation timed out. Check Inngest is running locally, open your project, or retry your prompt plan."
                  : "Image generation failed. Check Inngest is running locally, or go back and retry your prompt plan."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {productId ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/products/${productId}`}>Open project</Link>
                  </Button>
                ) : null}
                <Button type="button" size="sm" variant="outline" onClick={() => resetWizard("prompt")}>
                  Back to prompt plan
                </Button>
                <Button type="button" size="sm" onClick={() => resetWizard("fresh")}>
                  Start fresh
                </Button>
              </div>
            </div>
          ) : null}
          <Card className="border-[var(--accent)]/20 bg-[var(--accent-soft)]/30">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                  Pipeline status
                </p>
                <p className="font-serif text-xl">{formatPipelinePhase(pipelineStatus?.phase ?? "RECEIVING")}</p>
              </div>
              {!done && <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2" aria-label="Pipeline phases">
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
              <ProductImageGallery
                productId={productId ?? "wizard"}
                productName={form.name || "Product"}
                assets={galleryAssets}
                readOnly
              />
            </>
          ) : null}
          {done && productId && (
            <div
              ref={completionRef}
              className="scroll-mt-24 space-y-4 rounded-2xl border border-[var(--success-border)] bg-[var(--success-bg)]/40 p-5"
            >
              <div>
                <p className="font-semibold">Gallery complete — finish your listing</p>
                <p className="mt-1 text-sm text-[var(--muted-fg)]">
                  Download images, write copy, grade, and export from your project hub.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="rounded-xl" onClick={() => router.push(`/products/${productId}`)}>
                  View full project
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl">
                  <Link href={`/copy?productId=${productId}`}>Generate listing copy</Link>
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
              </div>
            </div>
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
