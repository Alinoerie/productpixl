"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowNotice } from "@/components/ui/workflow-notice";
import { InsufficientCreditsAlert } from "@/components/ui/insufficient-credits-alert";
import { useLiveCredits } from "@/hooks/use-live-credits";
import { DropZone } from "@/components/studio/drop-zone";
import { StepRail } from "@/components/studio/step-rail";
import { MasonryGallery } from "@/components/studio/masonry-gallery";
import { CreditEstimateBar } from "@/components/studio/credit-estimate-bar";
import { VisionAnalysisCard } from "@/components/studio/vision-analysis-card";
import { ProductIntakeFields } from "@/components/product/product-intake-fields";
import { fetchJson } from "@/lib/fetch-json";
import { EMPTY_PRODUCT_INTAKE, type ProductIntakeData } from "@/lib/product-intake";
import { quoteAplusRun } from "@/lib/credit-pricing";
import type { ProductAnalysis } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { PipelineProgressBar } from "@/components/ui/pipeline-progress-bar";
import type { PipelineStatusShape } from "@/lib/pipeline-progress";
import { useToast } from "@/components/ui/toast-provider";
import { Camera, Check, Images, Loader2, Sparkles } from "lucide-react";
import { type MarketplaceId } from "@/lib/marketplaces";
import { getVisualTemplate } from "@/lib/templates/catalog";
import { PIPELINE_ERROR, toSellerPipelineError } from "@/lib/pipeline-errors";
import { PipelineErrorMessage } from "@/components/ui/pipeline-error-message";
import {
  APLUS_MODULE_LIBRARY,
  DEFAULT_APLUS_MODULE_IDS,
  MAX_APLUS_MODULES,
  MIN_APLUS_MODULES,
  isPremiumAplusModule,
  type AplusModuleId,
} from "@/pipelines/aplus-modules";

interface PromptPlanItem {
  moduleId: string;
  label: string;
  resolution: "2K" | "4K";
  targetWidth: number;
  targetHeight: number;
  prompt: string;
}

const STEP_RAIL = [
  { id: "plan", label: "Product & plan", icon: Camera },
  { id: "gallery", label: "A+ gallery", icon: Images },
];

type LinkedProduct = {
  id: string;
  name: string;
  inputImageUrl: string;
  marketplace: MarketplaceId;
  brandRegistered?: boolean;
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

export function AplusStudioWorkspace({
  initialCredits,
  linkedProduct = null,
  missingProductId = false,
  defaultBrandName = "",
  templateSlug,
}: {
  initialCredits: number;
  linkedProduct?: LinkedProduct | null;
  missingProductId?: boolean;
  defaultBrandName?: string;
  templateSlug?: string;
}) {
  const { toast } = useToast();
  const [credits, setCredits] = useLiveCredits(initialCredits);
  const previewUrlRef = useRef<string | null>(null);
  const [step, setStep] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedModules, setSelectedModules] = useState<AplusModuleId[]>(DEFAULT_APLUS_MODULE_IDS);
  const [brandRegistered, setBrandRegistered] = useState(linkedProduct?.brandRegistered ?? false);
  const [marketplace, setMarketplace] = useState<MarketplaceId>("AMAZON_US");
  const [productId, setProductId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [planningPrompts, setPlanningPrompts] = useState(false);
  const [promptPlan, setPromptPlan] = useState<PromptPlanItem[]>([]);
  const [promptsExpanded, setPromptsExpanded] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatusShape | null>(null);
  const [savedAnalysis, setSavedAnalysis] = useState<ProductAnalysis | null>(null);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [form, setForm] = useState<ProductIntakeData>({
    ...EMPTY_PRODUCT_INTAKE,
    brandName: defaultBrandName,
  });

  const template = templateSlug ? getVisualTemplate(templateSlug) : undefined;

  const intakePayload = useCallback(
    (): ProductIntakeData => ({
      ...form,
      referenceImageUrls,
    }),
    [form, referenceImageUrls]
  );

  const aplusQuote = useMemo(
    () =>
      quoteAplusRun({
        selectedModules,
        brandRegistered,
        marketplace,
        intake: intakePayload(),
      }),
    [selectedModules, brandRegistered, marketplace, intakePayload]
  );

  const toggleModule = (id: AplusModuleId) => {
    if (id === "M1") return;
    setSelectedModules((prev) => {
      const has = prev.includes(id);
      if (has) {
        const next = prev.filter((m) => m !== id);
        return next.length >= MIN_APLUS_MODULES ? next : prev;
      }
      if (prev.length >= MAX_APLUS_MODULES) return prev;
      if (isPremiumAplusModule(id) && !brandRegistered) return prev;
      return [...prev, id].sort(
        (a, b) =>
          APLUS_MODULE_LIBRARY.findIndex((m) => m.id === a) -
          APLUS_MODULE_LIBRARY.findIndex((m) => m.id === b)
      );
    });
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { ok, data } = await fetchJson<{ url?: string; error?: string }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!ok || !data.url) throw new Error(data.error || "Upload failed");
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const local = URL.createObjectURL(file);
      previewUrlRef.current = local;
      setPreview(local);
      setImageUrl(data.url);
      setAnalyzing(true);
      const { ok: aOk, data: aData } = await fetchJson<{ analysis?: ProductAnalysis }>(
        "/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: data.url }),
        }
      );
      if (aOk && aData.analysis) {
        setSavedAnalysis(aData.analysis);
        setForm((f) => ({
          ...f,
          name: aData.analysis!.productName || f.name,
          category: aData.analysis!.amazonCategory || f.category,
          materials: aData.analysis!.materials || f.materials,
          colors: aData.analysis!.colors || f.colors,
          brandName: aData.analysis!.brandName || f.brandName || defaultBrandName,
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const buildPromptPlan = useCallback(async () => {
    setError("");
    setPlanningPrompts(true);
    try {
      const { ok, data } = await fetchJson<{ prompts?: PromptPlanItem[]; error?: string }>(
        "/api/generate/aplus/prompts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputImageUrl: imageUrl,
            selectedModules,
            brandRegistered,
            marketplace,
            productData: intakePayload(),
            analysis: savedAnalysis ?? undefined,
            templateSlug,
          }),
        }
      );
      if (!ok) throw new Error(data.error || "Failed to build prompt plan");
      setPromptPlan(data.prompts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to build prompt plan");
    } finally {
      setPlanningPrompts(false);
    }
  }, [imageUrl, selectedModules, brandRegistered, marketplace, intakePayload, savedAnalysis, templateSlug]);

  useEffect(() => {
    if (step !== 1 || promptPlan.length || planningPrompts || !imageUrl) return;
    void buildPromptPlan();
  }, [step, promptPlan.length, planningPrompts, imageUrl, buildPromptPlan]);

  const startGeneration = async () => {
    if (!promptPlan.length) {
      setError("Generate prompt plan first so you can review prompts.");
      return;
    }
    setError("");
    try {
      const { ok, status, data } = await fetchJson<{ productId?: string; error?: string }>(
        "/api/generate/aplus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            existingProductId: productId ?? linkedProduct?.id ?? undefined,
            inputImageUrl: imageUrl,
            selectedModules,
            brandRegistered,
            marketplace,
            productData: intakePayload(),
            analysis: savedAnalysis ?? undefined,
            templateSlug,
            promptOverrides: Object.fromEntries(promptPlan.map((p) => [p.moduleId, p.prompt])),
          }),
        }
      );
      if (status === 402) throw new Error("INSUFFICIENT_CREDITS");
      if (!ok) throw new Error(toSellerPipelineError(data.error || PIPELINE_ERROR.generationFailed));
      setProductId(data.productId ?? null);
      setStep(2);
      window.dispatchEvent(new Event("credits-updated"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : PIPELINE_ERROR.generationFailed;
      setError(msg === "INSUFFICIENT_CREDITS" ? "INSUFFICIENT_CREDITS" : toSellerPipelineError(msg));
    }
  };

  useEffect(() => {
    if (!productId || step !== 2) return;
    const poll = async () => {
      const { ok, data } = await fetchJson<{
        status?: string;
        pipelineStatus?: PipelineStatusShape;
      }>(`/api/products/${productId}/status`);
      if (!ok) return;
      if (data.pipelineStatus) setPipelineStatus(data.pipelineStatus);
      setRunStatus(data.status ?? null);
      if (data.status === "COMPLETE" || data.status === "FAILED") return;
      setTimeout(poll, 4000);
    };
    void poll();
  }, [productId, step]);

  const completedAssets = useMemo(() => {
    if (!pipelineStatus?.steps) return [];
    return pipelineStatus.steps
      .filter((s) => s.status === "COMPLETE" && s.imageUrl)
      .map((s) => ({ moduleId: s.id, imageUrl: s.imageUrl!, qaScore: s.qaScore }));
  }, [pipelineStatus]);

  useEffect(() => {
    if (linkedProduct) {
      setForm({
        ...EMPTY_PRODUCT_INTAKE,
        name: linkedProduct.name,
        brandName: linkedProduct.brandName || defaultBrandName,
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
      });
      setMarketplace(linkedProduct.marketplace);
      setBrandRegistered(linkedProduct.brandRegistered ?? false);
      setReferenceImageUrls(linkedProduct.referenceImageUrls ?? []);
      if (linkedProduct.inputImageUrl) {
        setImageUrl(linkedProduct.inputImageUrl);
        setPreview(linkedProduct.inputImageUrl);
      }
      setProductId(linkedProduct.id);
    }
  }, [linkedProduct, defaultBrandName]);

  const railIndex = step >= 2 ? 1 : 0;

  return (
    <div className="space-y-8">
      <WorkflowNotice
        initialCredits={credits}
        creditsRequired={aplusQuote.total}
        detailLine={aplusQuote.detailLine}
        description="A+ modules at exact Amazon dimensions. Select 6–12 modules; premium M11–M15 require Brand Registered."
      />

      {template ? (
        <p className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-soft)]/40 px-4 py-3 text-sm">
          Visual template <strong>{template.title}</strong> selected — prompts follow this layout with your brand palette.
        </p>
      ) : null}

      <StepRail steps={STEP_RAIL} currentIndex={railIndex} />

      {missingProductId ? (
        <p className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
          That project link is invalid.{" "}
          <Link href="/projects" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            View all projects
          </Link>
        </p>
      ) : null}

      {error === "INSUFFICIENT_CREDITS" ? (
        <InsufficientCreditsAlert required={aplusQuote.total} available={credits} />
      ) : null}

      {error && error !== "INSUFFICIENT_CREDITS" ? (
        <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
          <PipelineErrorMessage message={toSellerPipelineError(error)} supportSubject="ProductPixl A+ generation issue" />
        </div>
      ) : null}

      {step === 0 ? (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <DropZone
              preview={preview}
              fileName={form.name || "Product photo"}
              dragOver={dragOver}
              scanning={analyzing}
              disabled={uploading}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file?.type.startsWith("image/")) void upload(file);
              }}
              onFileSelect={(file) => void upload(file)}
              onClear={() => {
                setPreview("");
                setImageUrl("");
              }}
              inputId="aplus-upload"
            />
            <ProductIntakeFields
              form={form}
              onChange={setForm}
              marketplace={marketplace}
              onMarketplaceChange={setMarketplace}
              referenceImageUrls={referenceImageUrls}
              onReferenceImagesChange={setReferenceImageUrls}
              variant="images"
            />
            <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4">
              <input
                type="checkbox"
                checked={brandRegistered}
                onChange={(e) => {
                  setBrandRegistered(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedModules((prev) => prev.filter((id) => !isPremiumAplusModule(id)));
                  }
                }}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="text-sm">
                <strong>Brand Registered</strong> on Amazon — unlocks premium A+ modules M11–M15
              </span>
            </label>
            <div>
              <p className="mb-2 text-sm font-medium">
                A+ modules ({selectedModules.length}/{MAX_APLUS_MODULES}, min {MIN_APLUS_MODULES})
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {APLUS_MODULE_LIBRARY.map((mod) => {
                  const selected = selectedModules.includes(mod.id);
                  const locked = mod.premium && !brandRegistered;
                  const disabled = mod.id === "M1" || locked || (!selected && selectedModules.length >= MAX_APLUS_MODULES);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      disabled={disabled && !selected}
                      onClick={() => toggleModule(mod.id)}
                      className={cn(
                        "rounded-xl border p-3 text-left text-sm transition-colors",
                        selected ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)]",
                        locked && "opacity-50"
                      )}
                    >
                      <span className="font-semibold">{mod.id} · {mod.label}</span>
                      <span className="mt-1 block text-xs text-[var(--muted-fg)]">
                        {mod.targetWidth}×{mod.targetHeight}
                        {mod.premium ? " · Premium" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!imageUrl || !form.name || !form.category || selectedModules.length < MIN_APLUS_MODULES}
              onClick={() => setStep(1)}
            >
              Review prompts
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {savedAnalysis ? <VisionAnalysisCard analysis={savedAnalysis} /> : null}
            <CreditEstimateBar
              modules={selectedModules.map((id) => {
                const mod = APLUS_MODULE_LIBRARY.find((m) => m.id === id)!;
                return { label: mod.label, credits: Math.round(aplusQuote.total / selectedModules.length) };
              })}
              total={aplusQuote.total}
              caveat={aplusQuote.detailLine}
              ctaLabel={`Quote — ${aplusQuote.total} credits`}
              onCta={() => {}}
              disabled
            />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-6">
          {planningPrompts ? (
            <p className="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Building A+ prompt plan…
            </p>
          ) : null}
          {promptPlan.map((item, idx) => (
            <div key={item.moduleId} className="rounded-xl border border-[var(--border)] p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Label>
                  {item.moduleId} · {item.label} ({item.targetWidth}×{item.targetHeight})
                </Label>
                <span className="text-xs text-[var(--muted-fg)]">{item.resolution}</span>
              </div>
              <Textarea
                value={item.prompt}
                rows={6}
                onChange={(e) => {
                  const next = [...promptPlan];
                  next[idx] = { ...item, prompt: e.target.value };
                  setPromptPlan(next);
                }}
                className="font-mono text-xs"
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={() => void startGeneration()} disabled={!promptPlan.length || planningPrompts}>
              Start A+ generation — {aplusQuote.total} credits
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPromptsExpanded(!promptsExpanded)}>
              {promptsExpanded ? "Collapse" : "Expand"} all
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          {pipelineStatus ? (
            <>
              <PipelineProgressBar status={runStatus ?? "PROCESSING"} pipelineStatus={pipelineStatus} />
              {pipelineStatus.phase === "COMPLETE" ? (
                <p className="flex items-center gap-2 text-sm text-[var(--success)]">
                  <Check className="h-4 w-4" /> A+ content ready — download modules below
                </p>
              ) : null}
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating A+ modules…
            </p>
          )}
          {completedAssets.length > 0 ? (
            <MasonryGallery
              assets={completedAssets.map((a) => ({
                id: a.moduleId,
                moduleId: a.moduleId,
                imageUrl: a.imageUrl,
                qaScore: a.qaScore,
                status: "COMPLETE",
              }))}
            />
          ) : null}
          <Button variant="outline" onClick={() => setStep(0)}>
            New A+ run
          </Button>
        </div>
      ) : null}
    </div>
  );
}
