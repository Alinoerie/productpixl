"use client";

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save, Camera, RefreshCw, Copy, Plus, Trash2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { WorkflowNotice } from "@/components/ui/workflow-notice";
import { PageHeader } from "@/components/ui/page-header";
import { StepRail } from "@/components/studio/step-rail";
import { DropZone } from "@/components/studio/drop-zone";
import { CopyPreviewPanel } from "@/components/studio/copy-preview-panel";
import { StudioPreview } from "@/components/studio/studio-preview";
import { StudioSuccessBanner } from "@/components/ui/studio-success-banner";
import { fetchJson } from "@/lib/fetch-json";
import { CharCounter, LimitWarning } from "@/components/ui/char-counter";
import { InsufficientCreditsAlert } from "@/components/ui/insufficient-credits-alert";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { ProductIntakeFields } from "@/components/product/product-intake-fields";
import { EMPTY_PRODUCT_INTAKE, type ProductIntakeData } from "@/lib/product-intake";
import { quoteCopyRun, quoteCopyRunMulti, quoteCopySection } from "@/lib/credit-pricing";
import { CopyExportBar } from "@/components/studio/copy-export-bar";
import type { CopySectionId } from "@/pipelines/copy-gen";
import { CreditsRequiredLine } from "@/components/ui/credits-required-line";
import type { ProductAnalysis } from "@/lib/ai";
import { AMAZON_BULLET_MAX, AMAZON_TITLE_MAX } from "@/lib/amazon-limits";
import { loadCopyDraft } from "@/lib/copy-draft";
import { useLiveCredits } from "@/hooks/use-live-credits";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { cn } from "@/lib/utils";
import { type MarketplaceId } from "@/lib/marketplaces";
import { UnsavedNavigationGuard } from "@/hooks/use-unsaved-navigation-guard";
import { PIPELINE_ERROR, toSellerPipelineError } from "@/lib/pipeline-errors";
import { PipelineErrorMessage } from "@/components/ui/pipeline-error-message";
import { studioImagesHref } from "@/lib/studio-routes";

type LinkedProduct = {
  id: string;
  name: string;
  inputImageUrl: string;
  marketplace: MarketplaceId;
  materials?: string | null;
  keyFeatures?: string | null;
  targetBuyer?: string | null;
  amazonCategory?: string | null;
  competitors?: string | null;
  vibe?: string | null;
  useCase?: string | null;
  differentiators?: string | null;
  brandName?: string;
  listingCopy?: {
    title: string;
    bullets: string[];
    description?: string;
    backendKeywords?: string;
  } | null;
};

const COPY_STEP_RAIL = [
  { id: "details", label: "Product details", icon: Sparkles },
  { id: "edit", label: "Edit copy", icon: FileText },
];

function baselineFromListingCopy(lc: NonNullable<LinkedProduct["listingCopy"]>) {
  return {
    title: lc.title,
    bullets: lc.bullets,
    description: lc.description ?? "",
    backendKeywords: lc.backendKeywords ?? "",
  };
}

function copyFromListingCopy(lc: NonNullable<LinkedProduct["listingCopy"]>) {
  const baseline = baselineFromListingCopy(lc);
  return {
    title: baseline.title,
    bullets: baseline.bullets,
    description: baseline.description,
    backendKeywords: baseline.backendKeywords,
    status: "COMPLETE" as const,
  };
}

export function CopyWorkspace({
  initialCredits,
  linkedProduct = null,
  missingProductId = false,
  defaultBrandName = "",
  paymentSuccess = false,
  hidePageHeader = false,
}: {
  initialCredits: number;
  linkedProduct?: LinkedProduct | null;
  missingProductId?: boolean;
  defaultBrandName?: string;
  paymentSuccess?: boolean;
  hidePageHeader?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [credits] = useLiveCredits(initialCredits);
  const previewUrlRef = useRef<string | null>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const editCopyRef = useRef<HTMLDivElement>(null);
  const awaitingCompletion = useRef(false);
  const graderImportScrolled = useRef(false);
  const existingCopyScrolled = useRef(false);
  const hasExistingProjectCopy = Boolean(linkedProduct?.listingCopy?.title);
  const [showCompletionNudge, setShowCompletionNudge] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"regenerate" | "discard" | null>(null);
  const [linkedProductId, setLinkedProductId] = useState<string | null>(linkedProduct?.id ?? null);
  const [fromGrader, setFromGrader] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [marketplace, setMarketplace] = useState<MarketplaceId>("AMAZON_US");
  const [marketplaces, setMarketplaces] = useState<MarketplaceId[]>(["AMAZON_US"]);
  const [sectionRegenerating, setSectionRegenerating] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(
    hasExistingProjectCopy && linkedProduct ? linkedProduct.id : null
  );
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedBaseline, setSavedBaseline] = useState<{
    title: string;
    bullets: string[];
    description: string;
    backendKeywords: string;
  } | null>(
    linkedProduct?.listingCopy?.title ? baselineFromListingCopy(linkedProduct.listingCopy) : null
  );
  const [copy, setCopy] = useState<{
    title?: string;
    bullets?: string[];
    description?: string;
    backendKeywords?: string;
    status?: string;
  } | null>(
    linkedProduct?.listingCopy?.title ? copyFromListingCopy(linkedProduct.listingCopy) : null
  );
  const [form, setForm] = useState<ProductIntakeData>({
    ...EMPTY_PRODUCT_INTAKE,
    brandName: defaultBrandName,
  });
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);

  const copyQuote = useMemo(
    () =>
      marketplaces.length > 1
        ? quoteCopyRunMulti({
            marketplaces,
            intake: { ...form, referenceImageUrls },
          })
        : quoteCopyRun({
            marketplace,
            intake: { ...form, referenceImageUrls },
          }),
    [marketplace, marketplaces, form, referenceImageUrls]
  );

  const sectionQuote = useMemo(() => quoteCopySection(marketplace), [marketplace]);

  const reset = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreview("");
    setImageUrl("");
    setCopy(null);
    setProductId(null);
    setLinkedProductId(null);
    setFromGrader(false);
    setSavedBaseline(null);
    setError("");
    setLoading(false);
  };

  useEffect(() => {
    if (linkedProduct) return;
    const draft = loadCopyDraft();
    if (!draft?.title) return;
    const baseline = {
      title: draft.title,
      bullets: draft.bullets,
      description: draft.description ?? "",
      backendKeywords: draft.backendKeywords ?? "",
    };
    setCopy({
      title: draft.title,
      bullets: draft.bullets,
      description: draft.description,
      backendKeywords: draft.backendKeywords,
      status: "COMPLETE",
    });
    setSavedBaseline(baseline);
    setFromGrader(true);
    toast("Loaded listing from grader — save to a project without using a credit");
  }, [toast, linkedProduct]);

  useEffect(() => {
    if (!hasExistingProjectCopy || existingCopyScrolled.current) return;
    existingCopyScrolled.current = true;
    requestAnimationFrame(() => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      editCopyRef.current?.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
    });
  }, [hasExistingProjectCopy]);

  useEffect(() => {
    if (!fromGrader || !copy?.title || productId || graderImportScrolled.current) return;
    graderImportScrolled.current = true;
    requestAnimationFrame(() => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      completionRef.current?.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
    });
  }, [fromGrader, copy?.title, productId]);

  useEffect(() => {
    if (!linkedProduct) return;
    setLinkedProductId(linkedProduct.id);
    setMarketplace(linkedProduct.marketplace);
    setForm({
      name: linkedProduct.name,
      brandName: linkedProduct.brandName ?? defaultBrandName,
      category: linkedProduct.amazonCategory ?? "",
      materials: linkedProduct.materials ?? "",
      keyFeatures: linkedProduct.keyFeatures ?? "",
      targetBuyer: linkedProduct.targetBuyer ?? "",
      competitors: linkedProduct.competitors ?? "",
      vibe: linkedProduct.vibe ?? "",
      useCase: linkedProduct.useCase ?? "",
      differentiators: linkedProduct.differentiators ?? "",
      referenceImageUrls: [],
    });
    if (linkedProduct.inputImageUrl) {
      setImageUrl(linkedProduct.inputImageUrl);
      setPreview(linkedProduct.inputImageUrl);
    }
    if (linkedProduct.listingCopy?.title) {
      const baseline = baselineFromListingCopy(linkedProduct.listingCopy);
      setProductId(linkedProduct.id);
      setCopy(copyFromListingCopy(linkedProduct.listingCopy));
      setSavedBaseline(baseline);
    }
  }, [linkedProduct, defaultBrandName]);

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setPreview(objectUrl);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { ok, data } = await fetchJson<{ url?: string; error?: string }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url ?? "");
      const { ok: aOk, data: aData } = await fetchJson<{
        analysis?: ProductAnalysis;
        error?: string;
      }>(
        "/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: data.url }),
        }
      );
      if (aOk && aData.analysis) {
        const a = aData.analysis;
        setForm((prev) => ({
          ...prev,
          name: a.productName || prev.name,
          brandName: a.brandName || prev.brandName || defaultBrandName,
          category: a.amazonCategory || prev.category,
          materials: a.materials || prev.materials,
          keyFeatures: a.keyObservations || prev.keyFeatures,
          targetBuyer: a.suggestedTargetBuyer || prev.targetBuyer,
          useCase: a.useCase || prev.useCase,
          differentiators: a.differentiators || prev.differentiators,
          vibe: a.mood || prev.vibe,
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreview("");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) upload(file);
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    setShowCompletionNudge(false);
    awaitingCompletion.current = true;
    try {
      const res = await fetch("/api/generate/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: linkedProductId ?? undefined,
          inputImageUrl: imageUrl,
          marketplace,
          marketplaces: marketplaces.length > 1 ? marketplaces : undefined,
          productData: { ...form, referenceImageUrls },
        }),
      });
      const data = await res.json();
      if (res.status === 402) throw new Error("INSUFFICIENT_CREDITS");
      if (res.status === 503 && data.code === "INNGEST_NOT_CONFIGURED") {
        throw new Error(PIPELINE_ERROR.notConfigured);
      }
      if (!res.ok) throw new Error(toSellerPipelineError(data.error || PIPELINE_ERROR.copyFailed));
      setProductId(data.productId);
      window.dispatchEvent(new Event("credits-updated"));
    } catch (e) {
      const raw = e instanceof Error ? e.message : PIPELINE_ERROR.copyFailed;
      const msg = raw === "INSUFFICIENT_CREDITS" ? "INSUFFICIENT_CREDITS" : toSellerPipelineError(raw);
      setError(msg);
      setLoading(false);
      awaitingCompletion.current = false;
    }
  };

  const regenerateCopy = async () => {
    setCopy(null);
    setSavedBaseline(null);
    setShowCompletionNudge(false);
    await generate();
  };

  const regenerateSection = async (section: CopySectionId, bulletIndex?: number) => {
    if (!copy) return;
    const key = bulletIndex != null ? `bullet-${bulletIndex}` : section;
    setSectionRegenerating(key);
    try {
      const { ok, data } = await fetchJson<{ result?: string; error?: string }>(
        "/api/generate/copy/section",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section,
            bulletIndex,
            marketplace,
            productData: { ...form, referenceImageUrls },
            existingCopy: copy,
          }),
        }
      );
      if (!ok) throw new Error(data.error || "Regeneration failed");
      window.dispatchEvent(new Event("credits-updated"));
      if (section === "title") setCopy({ ...copy, title: data.result ?? copy.title });
      else if (section === "description") setCopy({ ...copy, description: data.result ?? copy.description });
      else if (section === "keywords") setCopy({ ...copy, backendKeywords: data.result ?? copy.backendKeywords });
      else if (section === "bullet" && bulletIndex != null) {
        const bullets = [...((copy.bullets as string[]) ?? [])];
        bullets[bulletIndex] = data.result ?? bullets[bulletIndex] ?? "";
        setCopy({ ...copy, bullets });
      }
      toast(`Regenerated (${sectionQuote.summary})`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Regeneration failed", "error");
    } finally {
      setSectionRegenerating(null);
    }
  };

  const requestRegenerate = () => setConfirmAction("regenerate");

  useEffect(() => {
    if (!productId) return;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      const res = await fetch(`/api/products/${productId}/status`);
      const data = await res.json();
      if (res.ok && data.listingCopy) {
        setCopy(data.listingCopy);
        if (data.listingCopy.status === "COMPLETE") {
          setSavedBaseline({
            title: data.listingCopy.title ?? "",
            bullets: (data.listingCopy.bullets as string[]) ?? [],
            description: data.listingCopy.description ?? "",
            backendKeywords: data.listingCopy.backendKeywords ?? "",
          });
        }
        if (data.listingCopy.status === "COMPLETE" || data.listingCopy.status === "FAILED") {
          setLoading(false);
          if (data.listingCopy.status === "FAILED") {
            awaitingCompletion.current = false;
            setError(toSellerPipelineError(data.listingCopy.errorMessage || PIPELINE_ERROR.copyFailed));
          } else if (awaitingCompletion.current) {
            awaitingCompletion.current = false;
            setShowCompletionNudge(true);
            toast("Listing copy complete");
            requestAnimationFrame(() => {
              const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              completionRef.current?.scrollIntoView({
                behavior: prefersReduced ? "auto" : "smooth",
                block: "start",
              });
            });
          }
        }
      } else if (attempts > 180) {
        setLoading(false);
        setError(PIPELINE_ERROR.copyTimedOut);
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [productId, toast]);

  const titleOverLimit = (copy?.title?.length ?? 0) > AMAZON_TITLE_MAX;
  const lacksCredits = credits < copyQuote.total;
  const canRetry = Boolean(error && error !== "INSUFFICIENT_CREDITS" && form.name.trim() && !loading);
  const showGraderImportBanner = Boolean(fromGrader && copy?.title && !productId);
  const showProjectNextSteps = Boolean(
    productId &&
      copy?.title &&
      (showCompletionNudge || (linkedProduct?.listingCopy?.title && !hasExistingProjectCopy))
  );
  const showNextStepsCard = showGraderImportBanner || showProjectNextSteps;
  const mobileStickyFooter =
    "sticky bottom-[var(--mobile-nav-offset)] z-10 md:static md:bottom-auto";

  const isDirty = useMemo(() => {
    if (!copy?.title || !savedBaseline) return false;
    return (
      copy.title !== savedBaseline.title ||
      JSON.stringify(copy.bullets ?? []) !== JSON.stringify(savedBaseline.bullets) ||
      (copy.description ?? "") !== savedBaseline.description ||
      (copy.backendKeywords ?? "") !== savedBaseline.backendKeywords
    );
  }, [copy, savedBaseline]);

  const copyStep = hasExistingProjectCopy
    ? isDirty
      ? 0
      : 1
    : copy?.title || loading
      ? 1
      : 0;

  const previewDraft = useMemo(
    () => ({
      title: copy?.title ?? form.name,
      bullets: copy?.bullets?.length ? copy.bullets : ["", "", "", "", ""],
      description: copy?.description ?? form.keyFeatures ?? "",
      backendKeywords: copy?.backendKeywords ?? "",
    }),
    [copy, form.name, form.keyFeatures]
  );
  const [showDescription, setShowDescription] = useState(false);

  const saveDraftToProject = useCallback(async () => {
    if (!copy?.title) return;
    setSaving(true);
    try {
      const res = await fetch("/api/products/listing-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim() || copy.title.slice(0, 80),
          title: copy.title,
          bullets: copy.bullets ?? [],
          description: copy.description,
          backendKeywords: copy.backendKeywords,
          marketplace,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setProductId(data.productId);
      setFromGrader(false);
      setSavedBaseline({
        title: copy.title,
        bullets: (copy.bullets as string[]) ?? [],
        description: copy.description ?? "",
        backendKeywords: copy.backendKeywords ?? "",
      });
      toast("Saved to new project");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save project", "error");
    } finally {
      setSaving(false);
    }
  }, [copy, form.name, marketplace, toast]);

  const saveCopy = useCallback(async () => {
    if (!productId || !copy?.title) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}/listing-copy`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: copy.title,
          bullets: copy.bullets ?? [],
          description: copy.description || null,
          backendKeywords: copy.backendKeywords || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSavedBaseline({
        title: copy.title,
        bullets: (copy.bullets as string[]) ?? [],
        description: copy.description ?? "",
        backendKeywords: copy.backendKeywords ?? "",
      });
      toast("Listing copy saved to project");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save copy", "error");
    } finally {
      setSaving(false);
    }
  }, [productId, copy, toast]);

  const copyField = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    toast(`${label} copied`);
  };

  const startOver = () => {
    if (isDirty) {
      setConfirmAction("discard");
      return;
    }
    reset();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty && !saving && productId) void saveCopy();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, saving, productId, saveCopy]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        "space-y-8",
        copy?.title && productId && isDirty && "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0"
      )}
    >
      <WorkflowNotice
        initialCredits={credits}
        creditsRequired={copyQuote.total}
        detailLine={copyQuote.detailLine}
        description="RUFUS-ready title, bullets, description, and backend keywords."
      />

      {paymentSuccess ? (
        <Suspense fallback={null}>
          <PaymentSuccessBanner />
        </Suspense>
      ) : null}

      {!hidePageHeader ? (
        <PageHeader
          eyebrow="Listing copy"
          title="Listing copy"
          description={
            <>
              Title, 5 bullets, description, backend keywords — RUFUS-ready ·{" "}
              <CreditsRequiredLine total={copyQuote.total} detailLine={copyQuote.detailLine} />
            </>
          }
        />
      ) : (
        <p className="text-sm text-[var(--muted-fg)]">
          Title, 5 bullets, description, backend keywords — RUFUS-ready ·{" "}
          <CreditsRequiredLine total={copyQuote.total} detailLine={copyQuote.detailLine} />
        </p>
      )}

      <div id="studio-steps" className="scroll-mt-24">
        <StepRail steps={COPY_STEP_RAIL} currentIndex={copyStep} />
      </div>

      {missingProductId ? (
        <p className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">
          That project link is invalid or no longer exists. Start a new copy run below or return to{" "}
          <Link href="/projects" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
            all projects
          </Link>
          .
        </p>
      ) : null}

      {linkedProduct ? (
        <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-soft)]/40 px-4 py-3 text-sm">
          {linkedProduct.listingCopy?.title ? (
            <>
              Editing existing copy for <strong>{linkedProduct.name}</strong>. Regenerating requires{" "}
              {copyQuote.summary} and replaces the current listing.
            </>
          ) : (
            <>
              Generating copy for <strong>{linkedProduct.name}</strong> — saves to your existing project.
            </>
          )}
        </div>
      ) : null}

      {error === "INSUFFICIENT_CREDITS" ? (
        <InsufficientCreditsAlert required={copyQuote.total} available={credits} />
      ) : null}

      {confirmAction === "regenerate" ? (
        <div
          className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3 text-sm"
          role="alertdialog"
          aria-labelledby="copy-regenerate-title"
        >
          <p id="copy-regenerate-title" className="font-medium text-[var(--foreground)]">
            Regenerate listing copy?
          </p>
          <p className="mt-1 text-[var(--muted-fg)]">
            This replaces the current text and requires <strong>{copyQuote.summary}</strong>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={lacksCredits || loading}
              onClick={() => {
                setConfirmAction(null);
                void regenerateCopy();
              }}
            >
              Regenerate copy
            </Button>
          </div>
        </div>
      ) : null}

      {confirmAction === "discard" ? (
        <div
          className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm"
          role="alertdialog"
          aria-labelledby="copy-discard-title"
        >
          <p id="copy-discard-title" className="text-[var(--error)]">
            Discard unsaved copy edits and start over?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setConfirmAction(null)}>
              Keep editing
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                setConfirmAction(null);
                reset();
              }}
            >
              Discard edits
            </Button>
          </div>
        </div>
      ) : null}

      {error && error !== "INSUFFICIENT_CREDITS" ? (
        <div className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
          <PipelineErrorMessage
            message={toSellerPipelineError(error)}
            supportSubject="ProductPixl copy generation issue"
          />
          {canRetry ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 border-[var(--error-border)]"
              onClick={() => {
                setError("");
                void generate();
              }}
            >
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">

      {!copy?.title && !loading && !hasExistingProjectCopy && (
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="copy-upload">Product image (optional but improves accuracy)</Label>
              <DropZone
                preview={preview}
                height="sm"
                dragOver={dragOver}
                disabled={uploading}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onFileSelect={upload}
                onClear={() => {
                  if (previewUrlRef.current) {
                    URL.revokeObjectURL(previewUrlRef.current);
                    previewUrlRef.current = null;
                  }
                  setPreview("");
                  setImageUrl("");
                }}
                emptyHint="Auto-fills product fields from vision AI"
                inputId="copy-upload"
              />
              {uploading && (
                <p className="mt-1 text-xs text-[var(--muted-fg)]">Uploading and analyzing image…</p>
              )}
            </div>
            <ProductIntakeFields
              form={form}
              onChange={setForm}
              marketplace={marketplace}
              onMarketplaceChange={(id) => {
                setMarketplace(id);
                setMarketplaces([id]);
              }}
              multiMarketplace={Boolean(copy?.title)}
              marketplaces={marketplaces}
              onMarketplacesChange={(ids) => {
                setMarketplaces(ids);
                setMarketplace(ids[0] ?? "AMAZON_US");
              }}
              referenceImageUrls={referenceImageUrls}
              onReferenceImagesChange={setReferenceImageUrls}
              variant="copy"
              disabled={uploading || loading}
            />
            <div className={cn(mobileStickyFooter, "-mx-6 mt-2 flex gap-3 border-t border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur-sm md:mx-0 md:mt-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none md:col-span-2")}>
              <Button
                onClick={generate}
                disabled={loading || uploading || !form.name.trim() || !form.category.trim() || lacksCredits}
                className="flex-1 md:col-span-2"
              >
                {lacksCredits
                  ? "Need credits to generate"
                  : loading
                    ? "Generating…"
                    : `Generate copy (${copyQuote.total.toLocaleString()} credits)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && !copy?.title && (
        <Card className="border-[var(--accent)]/20 bg-[var(--accent-soft)]/20" aria-busy="true">
          <CardContent className="flex items-center gap-4 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
            <div>
              <p className="font-semibold">Writing your listing copy…</p>
              <p className="mt-1 text-sm text-[var(--muted-fg)]">
                Title, bullets, description, and backend keywords — usually under a minute.
              </p>
            </div>
          </CardContent>
          <p className="sr-only" aria-live="polite">
            Generating listing copy
          </p>
        </Card>
      )}

      <p className="sr-only" aria-live="polite">
        {showCompletionNudge || showGraderImportBanner ? "Listing copy ready" : ""}
      </p>

      {copy?.title && (
        <div id="edit-copy" ref={editCopyRef} className="scroll-mt-24 space-y-4">
          {hasExistingProjectCopy && linkedProduct ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
              <p className="font-medium">Edit copy — {linkedProduct.name}</p>
              <p className="mt-1 text-sm text-[var(--muted-fg)]">
                Update title, bullets, and keywords below. Save to your project, or regenerate to replace with fresh AI
                copy ({copyQuote.summary}).
              </p>
            </div>
          ) : null}
          {showNextStepsCard ? (
            <StudioSuccessBanner
              innerRef={completionRef}
              title={
                showGraderImportBanner
                  ? "Imported from grader — save to a project"
                  : showCompletionNudge
                    ? "Copy ready — what's next?"
                    : "Project copy — next steps"
              }
              description={
                showGraderImportBanner
                  ? "Review the imported listing below, then save it to a project without spending a credit."
                  : "Review edits below, save to your project, then generate gallery images or grade the listing."
              }
            >
              {showGraderImportBanner ? (
                <>
                  <Button size="sm" disabled={saving} onClick={() => void saveDraftToProject()}>
                    <Save className="h-4 w-4" />
                    Save to project (free)
                  </Button>
                  <GradeListingButton
                    listingCopy={{
                      title: copy.title,
                      bullets: (copy.bullets as string[]) ?? [],
                      description: copy.description,
                      backendKeywords: copy.backendKeywords,
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Re-grade listing
                  </GradeListingButton>
                </>
              ) : (
                <>
                  <Button asChild size="sm">
                    <Link href={studioImagesHref({ productId })}>
                      <Camera className="h-4 w-4" />
                      Generate gallery
                    </Link>
                  </Button>
                  <GradeListingButton
                    listingCopy={{
                      title: copy.title,
                      bullets: (copy.bullets as string[]) ?? [],
                      description: copy.description,
                      backendKeywords: copy.backendKeywords,
                      productId: productId ?? undefined,
                    }}
                    productId={productId ?? undefined}
                    variant="outline"
                    size="sm"
                  >
                    Grade listing
                  </GradeListingButton>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/products/${productId}`}>Open project</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/products/${productId}#export`}>Export hub</Link>
                  </Button>
                </>
              )}
            </StudioSuccessBanner>
          ) : null}
          {titleOverLimit ? (
            <LimitWarning
              id="copy-title-warning"
              message={`Title exceeds Amazon's ${AMAZON_TITLE_MAX}-character limit — trim before publishing.`}
            />
          ) : null}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Title</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  disabled={Boolean(sectionRegenerating)}
                  onClick={() => void regenerateSection("title")}
                >
                  {sectionRegenerating === "title" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  <span className="ml-1 hidden sm:inline">Regen · 1 cr</span>
                </Button>
                <CharCounter id="copy-title-counter" value={copy.title ?? ""} max={AMAZON_TITLE_MAX} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => copyField("Title", copy.title ?? "")}
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="sr-only">Copy title</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                id="copy-title"
                value={copy.title}
                onChange={(e) => setCopy({ ...copy, title: e.target.value })}
                aria-describedby={
                  titleOverLimit ? "copy-title-counter copy-title-warning" : "copy-title-counter"
                }
                aria-invalid={titleOverLimit || undefined}
              />
            </CardContent>
          </Card>
          <details className="rounded-2xl border border-[var(--border)] bg-[var(--card)] md:contents">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 marker:content-none md:hidden [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-medium">
                Bullets ({((copy.bullets as string[]) ?? []).length})
              </span>
              <span className="text-xs text-[var(--muted-fg)]">Tap to expand</span>
            </summary>
            <div className="space-y-4 border-t border-[var(--border)] p-4 pt-3 md:contents md:border-0 md:p-0">
              <div className="hidden items-center justify-between gap-2 md:flex">
                <p className="text-sm font-medium text-[var(--muted-fg)]">Bullets</p>
                {((copy.bullets as string[]) ?? []).length < 5 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCopy({
                        ...copy,
                        bullets: [...((copy.bullets as string[]) ?? []), ""],
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add bullet
                  </Button>
                ) : null}
              </div>
              <div className="flex justify-end md:hidden">
                {((copy.bullets as string[]) ?? []).length < 5 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCopy({
                        ...copy,
                        bullets: [...((copy.bullets as string[]) ?? []), ""],
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add bullet
                  </Button>
                ) : null}
              </div>
              {(copy.bullets as string[] | undefined)?.map((b, i) => {
            const bulletOver = b.length > AMAZON_BULLET_MAX;
            return (
              <Card key={`bullet-${i}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-base">Bullet {i + 1}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      disabled={Boolean(sectionRegenerating)}
                      onClick={() => void regenerateSection("bullet", i)}
                    >
                      {sectionRegenerating === `bullet-${i}` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">Regenerate bullet {i + 1}</span>
                    </Button>
                    <CharCounter id={`copy-bullet-${i}-counter`} value={b} max={AMAZON_BULLET_MAX} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => copyField(`Bullet ${i + 1}`, b)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="sr-only">Copy bullet {i + 1}</span>
                    </Button>
                    {((copy.bullets as string[]) ?? []).length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[var(--muted-fg)] hover:text-[var(--error)]"
                        onClick={() => {
                          const bullets = ((copy.bullets as string[]) ?? []).filter((_, idx) => idx !== i);
                          setCopy({ ...copy, bullets });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove bullet {i + 1}</span>
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  {bulletOver ? (
                    <LimitWarning
                      id={`copy-bullet-${i}-warning`}
                      message={`Over ${AMAZON_BULLET_MAX} characters — trim before publishing.`}
                    />
                  ) : null}
                  <Textarea
                    id={`copy-bullet-${i}`}
                    value={b}
                    onChange={(e) => {
                      const bullets = [...((copy.bullets as string[]) || [])];
                      bullets[i] = e.target.value;
                      setCopy({ ...copy, bullets });
                    }}
                    aria-describedby={
                      bulletOver
                        ? `copy-bullet-${i}-counter copy-bullet-${i}-warning`
                        : `copy-bullet-${i}-counter`
                    }
                    aria-invalid={bulletOver || undefined}
                  />
                </CardContent>
              </Card>
            );
          })}
            </div>
          </details>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Description</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  disabled={Boolean(sectionRegenerating)}
                  onClick={() => void regenerateSection("description")}
                >
                  {sectionRegenerating === "description" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  <span className="sr-only">Regenerate description</span>
                </Button>
                {copy.description ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyField("Description", copy.description ?? "")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="sr-only">Copy description</span>
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[160px]"
                value={copy.description ?? ""}
                onChange={(e) => setCopy({ ...copy, description: e.target.value })}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Backend keywords</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  disabled={Boolean(sectionRegenerating)}
                  onClick={() => void regenerateSection("keywords")}
                >
                  {sectionRegenerating === "keywords" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  <span className="sr-only">Regenerate keywords</span>
                </Button>
                {copy.backendKeywords ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyField("Keywords", copy.backendKeywords ?? "")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="sr-only">Copy keywords</span>
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <Input
                value={copy.backendKeywords ?? ""}
                onChange={(e) => setCopy({ ...copy, backendKeywords: e.target.value })}
              />
            </CardContent>
          </Card>
          <CopyExportBar
            marketplaceId={marketplace}
            productName={form.name || linkedProduct?.name || "listing"}
            productId={productId}
            listingCopy={{
              title: copy.title ?? "",
              bullets: (copy.bullets as string[]) ?? [],
              description: copy.description,
              backendKeywords: copy.backendKeywords,
            }}
            saving={saving}
            onSave={
              productId
                ? () => void saveCopy()
                : !productId && copy.title
                  ? () => void saveDraftToProject()
                  : undefined
            }
          />
          <div className={cn("flex flex-wrap gap-3")}>
            {productId && (
              <Button asChild>
                <Link href={studioImagesHref({ productId })}>
                  <Camera className="h-4 w-4" />
                  Generate gallery images
                </Link>
              </Button>
            )}
            {productId && (
              <Button variant="outline" onClick={() => router.push(`/products/${productId}`)}>
                Open project
              </Button>
            )}
            {copy?.title ? (
              <GradeListingButton
                listingCopy={{
                  title: copy.title,
                  bullets: (copy.bullets as string[]) ?? [],
                  description: copy.description,
                  backendKeywords: copy.backendKeywords,
                  productId: productId ?? undefined,
                }}
                productId={productId ?? undefined}
                variant="outline"
              >
                Grade this copy
              </GradeListingButton>
            ) : null}
            {productId && !loading && copy?.title ? (
              <Button
                type="button"
                variant="outline"
                disabled={lacksCredits || saving}
                onClick={() => requestRegenerate()}
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate ({copyQuote.total.toLocaleString()} credits)
              </Button>
            ) : null}
            <Button variant="ghost" onClick={startOver} className={hasExistingProjectCopy ? "hidden" : undefined}>
              Start over
            </Button>
          </div>
          {isDirty ? (
            <p className="text-xs text-[var(--muted-fg)]">
              Unsaved edits — save from the bar below on mobile, or use Save / ⌘/Ctrl+S on desktop.
            </p>
          ) : null}
        </div>
      )}

        </div>

        <StudioPreview title="Live copy preview">
          <CopyPreviewPanel
            draft={previewDraft}
            showDescription={showDescription}
            onToggleDescription={() => setShowDescription((v) => !v)}
          />
        </StudioPreview>
      </div>

      {copy?.title && productId && isDirty ? (
        <div className="fixed inset-x-0 bottom-[var(--mobile-nav-offset)] z-30 border-t border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-md md:hidden">
          <Button className="w-full" size="sm" disabled={saving} onClick={saveCopy}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save to project
              </>
            )}
          </Button>
        </div>
      ) : null}

      <UnsavedNavigationGuard
        enabled={Boolean(isDirty && productId)}
        onSave={saveCopy}
        title="Unsaved listing edits"
        description="Save your copy changes before leaving Copy studio, or discard them to continue."
      />
    </div>
  );
}
