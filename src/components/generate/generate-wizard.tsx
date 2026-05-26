"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertBanner } from "@/components/ui/alert-banner";
import { WorkflowNotice } from "@/components/ui/workflow-notice";
import { fetchJson } from "@/lib/fetch-json";
import { cn } from "@/lib/utils";
import { formatPipelinePhase, formatModuleLabel } from "@/lib/status-labels";
import { Camera, Check, Loader2, Sparkles, Upload } from "lucide-react";
import { MARKETPLACES, type MarketplaceId } from "@/lib/marketplaces";

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

export function GenerateWizard({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const previewUrlRef = useRef<string | null>(null);
  const [step, setStep] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
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
  const [pipelineFailed, setPipelineFailed] = useState(false);

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
      setProductId(data.productId ?? null);
      setPipelineFailed(false);
      setStep(3);
      window.dispatchEvent(new Event("credits-updated"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg === "INSUFFICIENT_CREDITS" ? "INSUFFICIENT_CREDITS" : msg);
    }
  };

  const pollStatus = useCallback(async () => {
    if (!productId) return;
    const { ok, data } = await fetchJson<{ pipelineStatus?: typeof pipelineStatus; status?: string }>(
      `/api/products/${productId}/status`
    );
    if (ok) {
      setPipelineStatus(data.pipelineStatus as typeof pipelineStatus);
      if (data.status === "FAILED") {
        setPipelineFailed(true);
        return;
      }
      if (data.status === "COMPLETE" || data.status === "FAILED") return;
    }
  }, [productId]);

  useEffect(() => {
    if (step !== 3 || !productId) return;
    pollStatus();
    const id = setInterval(pollStatus, 2000);
    return () => clearInterval(id);
  }, [step, productId, pollStatus]);

  const done = pipelineStatus?.phase === "COMPLETE";

  const PHASES = ["RECEIVING", "ANALYZING", "RESEARCHING", "SELECTING", "GENERATING", "QA", "COMPLETE"];

  return (
    <div className="space-y-8">
      <WorkflowNotice
        initialCredits={initialCredits}
        description="Review prompts before any image is generated — PHOILA listing pipeline."
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-[var(--accent)]/30 text-[var(--accent)]">
            PHOILA pipeline
          </Badge>
          <h1 className="font-serif text-3xl md:text-4xl">Image studio</h1>
          <p className="mt-2 text-[var(--muted-fg)]">
            L1 hero · L3 lifestyle · L4 detail
            {includePackaging ? " · L8 packaging" : ""} — <strong className="text-[var(--foreground)]">1 credit</strong>
          </p>
        </div>
      </div>

      {/* Stepper */}
      <nav aria-label="Generation progress" className="flex items-center gap-0 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              aria-current={step === i ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                step === i
                  ? "bg-[var(--accent)] text-white"
                  : step > i
                    ? "bg-[var(--success-bg)] text-[var(--success)]"
                    : "bg-[var(--muted)] text-[var(--muted-fg)]"
              )}
            >
              {step > i ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs opacity-80">{i + 1}</span>}
              {label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-1 h-px w-6 sm:w-10", step > i ? "bg-[var(--success)]" : "bg-[var(--border)]")} />
            )}
          </div>
        ))}
      </nav>

      {error === "INSUFFICIENT_CREDITS" ? (
        <AlertBanner
          message="You need at least 1 credit to start an image run."
          actionHref="/pricing"
          actionLabel="Buy credits"
        />
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {step === 0 && (
        <Card className="overflow-hidden shadow-[var(--shadow-md)]">
          <CardContent className="space-y-6 p-6 md:p-8">
            <label
              className={cn(
                "flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors",
                preview
                  ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]/30"
                  : "border-[var(--border)] bg-[var(--muted)]/40 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/20"
              )}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="max-h-56 rounded-xl object-contain shadow-[var(--shadow-md)]" />
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card)] shadow-[var(--shadow-sm)]">
                    <Upload className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.5} />
                  </div>
                  <p className="mt-4 font-medium">Drop your product photo</p>
                  <p className="mt-1 text-sm text-[var(--muted-fg)]">JPG, PNG or WEBP · max 20MB</p>
                  <p className="mt-4 text-xs text-[var(--muted-fg)]">No ASIN needed — works for new launches</p>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </label>
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
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="shadow-[var(--shadow-md)]">
          <CardContent className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
            <p className="md:col-span-2 text-sm text-[var(--muted-fg)]">
              Review AI-extracted product data. Edit anything before generation — this feeds your PHOILA prompts.
            </p>
            {(
              [
                ["name", "Product name"],
                ["brandName", "Brand name"],
                ["category", "Amazon category"],
                ["dimensions", "Dimensions"],
                ["materials", "Materials"],
                ["colors", "Colors"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input value={form[key]} onChange={(e) => setField(key, e.target.value)} />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label>Key features</Label>
              <Textarea value={form.keyFeatures} onChange={(e) => setField("keyFeatures", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Target buyer</Label>
              <Input value={form.targetBuyer} onChange={(e) => setField("targetBuyer", e.target.value)} />
            </div>
            <div className="flex gap-3 md:col-span-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                onClick={() => {
                  setPromptPlan([]);
                  setStep(2);
                }}
                disabled={!form.name.trim()}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="shadow-[var(--shadow-md)]">
          <CardContent className="space-y-6 p-6 md:p-8">
            <div>
              <Label className="mb-2 block">Marketplace</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {MARKETPLACES.map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                      marketplace === m.id
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]/40"
                        : "border-[var(--border)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="marketplace"
                      className="mt-1"
                      checked={marketplace === m.id}
                      onChange={() => {
                        setMarketplace(m.id);
                        setPromptPlan([]);
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {m.flag} {m.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted-fg)]">{m.imageNote}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
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
              {promptPlan.length > 0 && (
                <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                  <p className="text-sm font-medium">
                    Prompt plan ready — edit anything below before generation:
                  </p>
                  {promptPlan.map((item, index) => (
                    <div key={item.moduleId} className="space-y-2 rounded-lg border bg-white/70 p-3">
                      <p className="text-sm font-semibold">
                        {index + 1}. {item.moduleId} · {item.label} ({item.resolution})
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
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={startGeneration}
                className="flex-1 rounded-xl"
                size="lg"
                disabled={!promptPlan.length || planningPrompts}
              >
                Start generation with reviewed prompts (1 credit)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {pipelineFailed && (
            <AlertBanner
              message="Image generation failed. Check Inngest is running locally, or go back and retry your prompt plan."
              actionHref="/generate"
              actionLabel="New run"
            />
          )}
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pipelineStatus?.steps?.map((s) => (
              <Card key={s.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-[var(--muted)]">
                    {s.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[var(--muted-fg)]">
                        {s.status}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {formatModuleLabel(s.id)}
                        {s.label ? ` — ${s.label}` : ""}
                      </p>
                      {s.qaScore != null && (
                        <Badge variant="secondary">QA {s.qaScore}/10</Badge>
                      )}
                    </div>
                    {s.prompt && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-medium text-[var(--muted-fg)]">
                          View prompt used
                        </summary>
                        <Textarea className="mt-2 min-h-[160px] text-xs" value={s.prompt} readOnly />
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {done && productId && (
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-xl" onClick={() => router.push(`/products/${productId}`)}>
                View full project
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/copy">Generate listing copy</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
