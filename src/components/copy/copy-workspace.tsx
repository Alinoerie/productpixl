"use client";

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, Save, Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { WorkflowNotice } from "@/components/ui/workflow-notice";
import { PageHeader } from "@/components/ui/page-header";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { MarketplacePicker } from "@/components/ui/marketplace-picker";
import { StudioStepper } from "@/components/ui/studio-stepper";
import { fetchJson } from "@/lib/fetch-json";
import { CharCounter, LimitWarning } from "@/components/ui/char-counter";
import { InsufficientCreditsAlert } from "@/components/ui/insufficient-credits-alert";
import { BrandSetupNudge } from "@/components/ui/brand-setup-nudge";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { AMAZON_BULLET_MAX, AMAZON_TITLE_MAX } from "@/lib/amazon-limits";
import { loadCopyDraft } from "@/lib/copy-draft";
import { useLiveCredits } from "@/hooks/use-live-credits";
import { PaymentSuccessBanner } from "@/components/account/payment-success-banner";
import { cn } from "@/lib/utils";
import { type MarketplaceId, getMarketplace } from "@/lib/marketplaces";

type LinkedProduct = {
  id: string;
  name: string;
  inputImageUrl: string;
  marketplace: MarketplaceId;
  materials?: string | null;
  keyFeatures?: string | null;
  targetBuyer?: string | null;
  amazonCategory?: string | null;
  brandName?: string;
  listingCopy?: {
    title: string;
    bullets: string[];
    description?: string;
    backendKeywords?: string;
  } | null;
};

const COPY_STEPS = ["Details", "Generate", "Edit copy"];

const FIELD_LABELS: Record<string, string> = {
  name: "Product name",
  brandName: "Brand name",
  category: "Amazon category",
  materials: "Materials",
  targetBuyer: "Target buyer",
};

export function CopyWorkspace({
  initialCredits,
  linkedProduct = null,
  missingProductId = false,
  brandConfigured = true,
  defaultBrandName = "",
  paymentSuccess = false,
}: {
  initialCredits: number;
  linkedProduct?: LinkedProduct | null;
  missingProductId?: boolean;
  brandConfigured?: boolean;
  defaultBrandName?: string;
  paymentSuccess?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [credits] = useLiveCredits(initialCredits);
  const previewUrlRef = useRef<string | null>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const awaitingCompletion = useRef(false);
  const [showCompletionNudge, setShowCompletionNudge] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"regenerate" | "discard" | null>(null);
  const [linkedProductId, setLinkedProductId] = useState<string | null>(linkedProduct?.id ?? null);
  const [fromGrader, setFromGrader] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [marketplace, setMarketplace] = useState<MarketplaceId>("AMAZON_US");
  const [productId, setProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBaseline, setSavedBaseline] = useState<{
    title: string;
    bullets: string[];
    description: string;
    backendKeywords: string;
  } | null>(null);
  const [copy, setCopy] = useState<{
    title?: string;
    bullets?: string[];
    description?: string;
    backendKeywords?: string;
    status?: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    brandName: defaultBrandName,
    category: "",
    materials: "",
    keyFeatures: "",
    targetBuyer: "",
  });

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
  }, [toast]);

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
    });
    if (linkedProduct.inputImageUrl) {
      setImageUrl(linkedProduct.inputImageUrl);
      setPreview(linkedProduct.inputImageUrl);
    }
    if (linkedProduct.listingCopy?.title) {
      const baseline = {
        title: linkedProduct.listingCopy.title,
        bullets: linkedProduct.listingCopy.bullets,
        description: linkedProduct.listingCopy.description ?? "",
        backendKeywords: linkedProduct.listingCopy.backendKeywords ?? "",
      };
      setProductId(linkedProduct.id);
      setCopy({
        title: baseline.title,
        bullets: baseline.bullets,
        description: baseline.description,
        backendKeywords: baseline.backendKeywords,
        status: "COMPLETE",
      });
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
      const { ok: aOk, data: aData } = await fetchJson<{ analysis?: Record<string, string> }>(
        "/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: data.url }),
        }
      );
      if (aOk && aData.analysis) {
        const a = aData.analysis;
        setForm({
          name: a.productName || "",
          brandName: a.brandName || "",
          category: a.amazonCategory || "",
          materials: a.materials || "",
          keyFeatures: a.keyObservations || "",
          targetBuyer: "",
        });
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
          productData: form,
        }),
      });
      const data = await res.json();
      if (res.status === 402) throw new Error("INSUFFICIENT_CREDITS");
      if (!res.ok) throw new Error(data.error);
      setProductId(data.productId);
      window.dispatchEvent(new Event("credits-updated"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg === "INSUFFICIENT_CREDITS" ? "INSUFFICIENT_CREDITS" : msg);
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
            setError(data.listingCopy.errorMessage || "Copy generation failed");
          } else if (awaitingCompletion.current) {
            awaitingCompletion.current = false;
            setShowCompletionNudge(true);
            toast("Listing copy ready — review and save to your project");
            requestAnimationFrame(() => {
              completionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }
        }
      } else if (attempts > 90) {
        setLoading(false);
        setError("Copy generation timed out. Check Inngest is running.");
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [productId, toast]);

  const exportJson = () => {
    if (!copy) return;
    const blob = new Blob([JSON.stringify(copy, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "listing-copy.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const titleOverLimit = (copy?.title?.length ?? 0) > AMAZON_TITLE_MAX;
  const copyStep = copy?.title ? 2 : loading ? 1 : 0;
  const lacksCredits = credits < 1;
  const categoryLabel = `${getMarketplace(marketplace).label} category`;
  const canRetry = Boolean(error && error !== "INSUFFICIENT_CREDITS" && form.name.trim() && !loading);
  const showNextStepsCard = Boolean(
    productId && copy?.title && (showCompletionNudge || linkedProduct?.listingCopy?.title)
  );
  const mobileStickyFooter =
    "sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-10 md:static md:bottom-auto";

  const isDirty = useMemo(() => {
    if (!copy?.title || !savedBaseline) return false;
    return (
      copy.title !== savedBaseline.title ||
      JSON.stringify(copy.bullets ?? []) !== JSON.stringify(savedBaseline.bullets) ||
      (copy.description ?? "") !== savedBaseline.description ||
      (copy.backendKeywords ?? "") !== savedBaseline.backendKeywords
    );
  }, [copy, savedBaseline]);

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
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  return (
    <div className="space-y-8">
      <WorkflowNotice
        initialCredits={credits}
        description="RUFUS-ready title, bullets, description, and backend keywords."
      />

      {paymentSuccess ? (
        <Suspense fallback={null}>
          <PaymentSuccessBanner />
        </Suspense>
      ) : null}

      <BrandSetupNudge configured={brandConfigured} />

      <PageHeader
        eyebrow="Copy pipeline"
        title="Listing copy"
        description={
          <>
            Title, 5 bullets, description, backend keywords — RUFUS-ready ·{" "}
            <strong className="text-[var(--foreground)]">1 credit</strong>
          </>
        }
      />

      <StudioStepper steps={COPY_STEPS} currentStep={copyStep} label="Copy pipeline progress" />

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
              Editing existing copy for <strong>{linkedProduct.name}</strong>. Regenerating costs 1 credit and
              replaces the current listing.
            </>
          ) : (
            <>
              Generating copy for <strong>{linkedProduct.name}</strong> — saves to your existing project.
            </>
          )}
        </div>
      ) : fromGrader && copy?.title && !productId ? (
        <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)]/30 px-4 py-3 text-sm text-[var(--foreground)]">
          Imported from grader — save this listing to a project without spending a credit.
        </div>
      ) : null}

      {error === "INSUFFICIENT_CREDITS" ? <InsufficientCreditsAlert /> : null}

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
            This replaces the current text and costs <strong>1 credit</strong>.
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
          <p>{error}</p>
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

      {!copy?.title && !loading && (
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            {linkedProduct?.listingCopy?.title ? (
              <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 text-sm">
                <p className="font-medium">This project already has listing copy.</p>
                <p className="mt-1 text-[var(--muted-fg)]">
                  Scroll down to edit, or regenerate below to replace it with fresh AI copy (1 credit).
                </p>
              </div>
            ) : null}
            <div className="md:col-span-2">
              <Label htmlFor="copy-upload">Product image (optional but improves accuracy)</Label>
              <UploadDropzone
                preview={preview}
                previewAlt="Product photo for copy generation"
                dragOver={dragOver}
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
                disabled={uploading}
                minHeight="min-h-[180px]"
                emptyHint="Auto-fills product fields from vision AI"
                inputId="copy-upload"
              />
              {uploading && (
                <p className="mt-1 text-xs text-[var(--muted-fg)]">Uploading and analyzing image…</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Marketplace</Label>
              <MarketplacePicker
                value={marketplace}
                onChange={setMarketplace}
                noteField="copyNote"
                name="copy-marketplace"
              />
            </div>
            {(["name", "brandName", "category", "materials", "targetBuyer"] as const).map((key) => (
              <div key={key}>
                <Label htmlFor={`copy-${key}`}>
                  {key === "category" ? categoryLabel : FIELD_LABELS[key] ?? key}
                </Label>
                <Input
                  id={`copy-${key}`}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <Label htmlFor="copy-features">Key features</Label>
              <Textarea
                id="copy-features"
                value={form.keyFeatures}
                onChange={(e) => setForm((f) => ({ ...f, keyFeatures: e.target.value }))}
              />
            </div>
            <div className={cn(mobileStickyFooter, "-mx-6 mt-2 flex gap-3 border-t border-[var(--border)] bg-[var(--card)]/95 p-4 backdrop-blur-sm md:mx-0 md:mt-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none md:col-span-2")}>
              <Button
                onClick={generate}
                disabled={loading || uploading || !form.name.trim() || lacksCredits}
                className="flex-1 md:col-span-2"
              >
                {lacksCredits ? "Need credits to generate" : loading ? "Generating…" : "Generate copy (1 credit)"}
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
        {showCompletionNudge ? "Listing copy ready" : ""}
      </p>

      {copy?.title && (
        <div className="space-y-4">
          {showNextStepsCard ? (
            <Card
              ref={completionRef}
              className="scroll-mt-24 border-[var(--success-border)] bg-[var(--success-bg)]/40"
            >
              <CardContent className="py-4">
                <p className="font-semibold">
                  {showCompletionNudge ? "Copy ready — what&apos;s next?" : "Project copy — next steps"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-fg)]">
                  Review edits below, save to your project, then generate gallery images or grade the listing.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/generate?productId=${productId}`}>
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
                </div>
              </CardContent>
            </Card>
          ) : null}
          {titleOverLimit ? (
            <LimitWarning
              message={`Title exceeds Amazon's ${AMAZON_TITLE_MAX}-character limit — trim before publishing.`}
            />
          ) : null}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Title</CardTitle>
              <CharCounter value={copy.title} max={AMAZON_TITLE_MAX} />
            </CardHeader>
            <CardContent>
              <Textarea value={copy.title} onChange={(e) => setCopy({ ...copy, title: e.target.value })} />
            </CardContent>
          </Card>
          {(copy.bullets as string[] | undefined)?.map((b, i) => {
            const bulletOver = b.length > AMAZON_BULLET_MAX;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-base">Bullet {i + 1}</CardTitle>
                  <CharCounter value={b} max={AMAZON_BULLET_MAX} />
                </CardHeader>
                <CardContent>
                  {bulletOver ? (
                    <LimitWarning message={`Over ${AMAZON_BULLET_MAX} characters — trim before publishing.`} />
                  ) : null}
                  <Textarea
                    value={b}
                    onChange={(e) => {
                      const bullets = [...((copy.bullets as string[]) || [])];
                      bullets[i] = e.target.value;
                      setCopy({ ...copy, bullets });
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
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
            <CardHeader>
              <CardTitle className="text-base">Backend keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={copy.backendKeywords ?? ""}
                onChange={(e) => setCopy({ ...copy, backendKeywords: e.target.value })}
              />
            </CardContent>
          </Card>
          <div className={cn(mobileStickyFooter, "-mx-0 flex flex-wrap gap-3 border-t border-[var(--border)] bg-[var(--background)]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm md:border-0 md:bg-transparent md:p-0 md:pb-0 md:backdrop-blur-none")}>
            {!productId && copy?.title ? (
              <Button size="sm" disabled={saving} onClick={saveDraftToProject}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save to new project
                  </>
                )}
              </Button>
            ) : null}
            {productId ? (
              <Button size="sm" disabled={!isDirty || saving} onClick={saveCopy}>
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
            ) : null}
            <Button variant="outline" onClick={exportJson}>
              Download JSON
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  [
                    copy.title,
                    "",
                    ...(copy.bullets ?? []).map((b, i) => `${i + 1}. ${b}`),
                    "",
                    copy.description ?? "",
                  ].join("\n")
                );
                setCopiedAll(true);
                toast("Listing copy copied to clipboard");
                setTimeout(() => setCopiedAll(false), 2000);
              }}
            >
              {copiedAll ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                "Copy all text"
              )}
            </Button>
            {productId && (
              <Button asChild>
                <Link href={`/generate?productId=${productId}`}>
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
                Regenerate (1 credit)
              </Button>
            ) : null}
            <Button variant="ghost" onClick={startOver}>
              Start over
            </Button>
          </div>
          {isDirty ? (
            <p className="text-xs text-[var(--muted-fg)]">Unsaved edits — save to project or use ⌘/Ctrl+S.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
