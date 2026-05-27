"use client";

import { useEffect, useState } from "react";
import { Camera, Film, Loader2, Sparkles } from "lucide-react";
import { DropZone } from "@/components/studio/drop-zone";
import { StepRail } from "@/components/studio/step-rail";
import { StudioPreview } from "@/components/studio/studio-preview";
import { CreditEstimateBar } from "@/components/studio/credit-estimate-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MOTION_STYLES,
  VIDEO_FORMATS,
  useVideoStudioStore,
} from "@/stores/video-studio-store";
import { useBrandStore } from "@/stores/brand-store";
import { cn } from "@/lib/utils";
import { STUDIO_TRANSITION } from "@/lib/studio-motion";
import { fetchJson } from "@/lib/fetch-json";
import { useToast } from "@/components/ui/toast-provider";

const STEPS = [
  { id: "product", label: "Product & format", icon: Camera },
  { id: "preview", label: "Preview & export", icon: Film },
];

export function VideoStudioWorkspace({ initialCredits }: { initialCredits: number }) {
  const { toast } = useToast();
  const profile = useBrandStore((s) => s.profile);
  const {
    previewUrl,
    format,
    motionStyle,
    musicEnabled,
    musicGenre,
    creditTotal,
    setPreviewUrl,
    setFormat,
    setMotionStyle,
    setMusicEnabled,
    setMusicGenre,
  } = useVideoStudioStore();
  const [step, setStep] = useState(0);
  const selectedFormat = VIDEO_FORMATS.find((f) => f.id === format)!;

  useEffect(() => {
    const base = selectedFormat.credits + (musicEnabled ? 8 : 0);
    useVideoStudioStore.setState({ creditTotal: base });
  }, [format, musicEnabled, selectedFormat.credits]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");

  async function onFile(file: File) {
    setUploading(true);
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { ok, data } = await fetchJson<{ url?: string; error?: string }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!ok) throw new Error(data.error || "Upload failed");
      setUploadedUrl(data.url ?? "");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      setScanning(true);
      setTimeout(() => setScanning(false), 1800);
    }
  }

  async function queueVideo() {
    if (!uploadedUrl) {
      toast("Upload a product photo first", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { ok, data } = await fetchJson<{
        productId?: string;
        message?: string;
        error?: string;
      }>("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputImageUrl: uploadedUrl,
          format,
          motionStyle,
          musicEnabled,
          musicGenre,
          productName: fileName.replace(/\.[^.]+$/, "") || "Product video",
        }),
      });
      if (!ok) throw new Error(data.error || "Could not queue video");
      window.dispatchEvent(new Event("credits-updated"));
      toast(data.message ?? "Video queued — beta rendering ships soon");
      setStep(1);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Video queue failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl">Video</h1>
            <Badge variant="outline" className="border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning)]">
              Beta
            </Badge>
          </div>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted-fg)]">
            Turn your product photo into a shoppable video reel — hero shot, lifestyle loop, and feature showcase.
          </p>
        </div>
      </div>

      <StepRail steps={STEPS} currentIndex={step} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {step === 0 ? (
            <>
              <DropZone
                preview={previewUrl}
                fileName={fileName}
                dragOver={dragOver}
                scanning={scanning}
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
                  if (file?.type.startsWith("image/")) void onFile(file);
                }}
                onFileSelect={(file) => void onFile(file)}
                onClear={() => {
                  setPreviewUrl("");
                  setFileName("");
                }}
                inputId="video-upload"
              />

              <div>
                <p className="mb-3 text-[13px] font-medium">Format</p>
                <div className="grid grid-cols-2 gap-3">
                  {VIDEO_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 motion-reduce:transform-none",
                        STUDIO_TRANSITION.lift,
                        format === f.id
                          ? "border-[var(--brand-primary,var(--accent))] shadow-[0_0_0_2px_color-mix(in_srgb,var(--brand-primary,var(--accent))_35%,transparent)]"
                          : "border-[var(--border)]"
                      )}
                      style={{ ["--brand-primary" as string]: profile.primaryColor }}
                    >
                      <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-bold">{f.ratio}</span>
                      <p className="mt-2 text-sm font-semibold">{f.label}</p>
                      <p className="text-xs text-[var(--muted-fg)]">{f.duration} · ~{f.credits} cr</p>
                      <p className="mt-1 text-[10px] text-[var(--muted-fg)]">{f.platforms.join(" · ")}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[13px] font-medium">Motion style</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {MOTION_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setMotionStyle(s.id)}
                      className={cn(
                        "min-w-[140px] shrink-0 rounded-xl border p-3 text-left text-xs",
                        motionStyle === s.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)]"
                      )}
                    >
                      <p className="font-semibold">{s.label}</p>
                      <p className="mt-1 text-[var(--muted-fg)]">{s.example}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4">
                <label className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Add background music</span>
                  <input
                    type="checkbox"
                    checked={musicEnabled}
                    onChange={(e) => setMusicEnabled(e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                </label>
                {musicEnabled ? (
                  <select
                    value={musicGenre}
                    onChange={(e) => setMusicGenre(e.target.value)}
                    className="mt-3 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                  >
                    <option value="upbeat">Upbeat</option>
                    <option value="calm">Calm</option>
                    <option value="energetic">Energetic</option>
                    <option value="none">None</option>
                  </select>
                ) : null}
                <p className="mt-2 text-xs text-[var(--muted-fg)]">Royalty-free, cleared for Amazon and TikTok.</p>
              </div>

              <CreditEstimateBar
                modules={[
                  { label: "Base render", credits: Math.round(selectedFormat.credits * 0.5) },
                  { label: "Motion", credits: Math.round(selectedFormat.credits * 0.35) },
                  { label: "Music sync", credits: musicEnabled ? 8 : 0 },
                ].filter((m) => m.credits > 0)}
                total={creditTotal}
                caveat="Video uses more credits than images — final quote at render time."
                ctaLabel={`Generate — ${creditTotal} credits`}
                onCta={() => void queueVideo()}
                disabled={!previewUrl || !uploadedUrl || initialCredits < creditTotal}
                loading={submitting}
                loadingLabel="Queuing…"
              />
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--muted-fg)]">
                Preview your reel below. Export buttons match platform specs when rendering is live.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Export for TikTok", "Export for Amazon", "Export for Reels"].map((label) => (
                  <Button key={label} variant="outline" size="sm" disabled>
                    {label}
                  </Button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
            </>
          )}
        </div>

        <StudioPreview title="Phone preview">
          <div className="mx-auto w-[200px] rounded-[2rem] border-[6px] border-[var(--ink)] bg-[var(--ink)] p-1 shadow-[var(--shadow-lg)]">
            <div
              className="relative aspect-[9/16] overflow-hidden rounded-[1.4rem]"
              style={{
                background: `linear-gradient(160deg, ${profile.primaryColor}55, ${profile.secondaryColor}66)`,
              }}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="h-full w-full object-cover opacity-90" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-white/70">Upload a product photo</div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-[10px] font-semibold text-white">{selectedFormat.label}</p>
                <p className="text-[9px] text-white/70">{selectedFormat.ratio} · {selectedFormat.duration}</p>
              </div>
            </div>
          </div>
          {step === 0 && !previewUrl ? (
            <p className="mt-4 text-center text-xs text-[var(--muted-fg)]">
              <Sparkles className="mr-1 inline h-3 w-3" />
              Vision AI will detect product and category on upload
            </p>
          ) : null}
          {uploading ? (
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--muted-fg)]">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
            </p>
          ) : null}
        </StudioPreview>
      </div>
    </div>
  );
}
