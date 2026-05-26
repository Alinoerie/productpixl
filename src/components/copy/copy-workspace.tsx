"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertBanner } from "@/components/ui/alert-banner";
import { useToast } from "@/components/ui/toast-provider";
import { WorkflowNotice } from "@/components/ui/workflow-notice";
import { PageHeader } from "@/components/ui/page-header";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { MarketplacePicker } from "@/components/ui/marketplace-picker";
import { StudioStepper } from "@/components/ui/studio-stepper";
import { fetchJson } from "@/lib/fetch-json";
import { AMAZON_BULLET_MAX, AMAZON_TITLE_MAX, charCountLabel } from "@/lib/amazon-limits";
import { type MarketplaceId } from "@/lib/marketplaces";
import { cn } from "@/lib/utils";

const COPY_STEPS = ["Details", "Generate", "Edit copy"];

const FIELD_LABELS: Record<string, string> = {
  name: "Product name",
  brandName: "Brand name",
  category: "Amazon category",
  materials: "Materials",
  targetBuyer: "Target buyer",
};

function CharCounter({ value, max }: { value: string; max: number }) {
  const { label, over } = charCountLabel(value, max);
  return (
    <p className={cn("mt-1 text-right text-xs tabular-nums", over ? "text-red-600" : "text-[var(--muted-fg)]")}>
      {label}
    </p>
  );
}

export function CopyWorkspace({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const { toast } = useToast();
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
    brandName: "",
    category: "",
    materials: "",
    keyFeatures: "",
    targetBuyer: "",
  });

  const reset = () => {
    setCopy(null);
    setProductId(null);
    setSavedBaseline(null);
    setError("");
    setLoading(false);
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    const objectUrl = URL.createObjectURL(file);
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
    try {
      const res = await fetch("/api/generate/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputImageUrl: imageUrl, marketplace, productData: form }),
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
    }
  };

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
            setError(data.listingCopy.errorMessage || "Copy generation failed");
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
  }, [productId]);

  const exportJson = () => {
    if (!copy) return;
    const blob = new Blob([JSON.stringify(copy, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "listing-copy.json";
    a.click();
  };

  const titleCount = charCountLabel(copy?.title ?? "", AMAZON_TITLE_MAX);
  const copyStep = copy?.title ? 2 : loading ? 1 : 0;
  const lacksCredits = initialCredits < 1;

  const isDirty = useMemo(() => {
    if (!copy?.title || !savedBaseline) return false;
    return (
      copy.title !== savedBaseline.title ||
      JSON.stringify(copy.bullets ?? []) !== JSON.stringify(savedBaseline.bullets) ||
      (copy.description ?? "") !== savedBaseline.description ||
      (copy.backendKeywords ?? "") !== savedBaseline.backendKeywords
    );
  }, [copy, savedBaseline]);

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
    if (isDirty && !window.confirm("Discard unsaved copy edits?")) return;
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

  return (
    <div className="space-y-8">
      <WorkflowNotice
        initialCredits={initialCredits}
        description="RUFUS-ready title, bullets, description, and backend keywords."
      />

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

      {error === "INSUFFICIENT_CREDITS" ? (
        <AlertBanner
          message="You need at least 1 credit to generate listing copy."
          actionHref="/pricing"
          actionLabel="Buy credits"
        />
      ) : error ? (
        <p className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">{error}</p>
      ) : null}

      {!copy?.title && !loading && (
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
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
                <Label htmlFor={`copy-${key}`}>{FIELD_LABELS[key] ?? key}</Label>
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
            <Button
              onClick={generate}
              disabled={loading || uploading || !form.name.trim() || lacksCredits}
              className="md:col-span-2"
            >
              {lacksCredits ? "Need credits to generate" : loading ? "Generating…" : "Generate copy (1 credit)"}
            </Button>
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
        </Card>
      )}

      {copy?.title && (
        <div className="space-y-4">
          {titleCount.over && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Title exceeds Amazon&apos;s {AMAZON_TITLE_MAX}-character limit — trim before publishing.
            </p>
          )}
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
            const bulletCount = charCountLabel(b, AMAZON_BULLET_MAX);
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-base">Bullet {i + 1}</CardTitle>
                  <CharCounter value={b} max={AMAZON_BULLET_MAX} />
                </CardHeader>
                <CardContent>
                  {bulletCount.over && (
                    <p className="mb-2 text-xs text-amber-700">Over {AMAZON_BULLET_MAX} characters</p>
                  )}
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
          <div className="flex flex-wrap gap-3">
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
              <Button variant="outline" onClick={() => router.push(`/products/${productId}`)}>
                Open project
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/grader">Grade this copy</Link>
            </Button>
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
