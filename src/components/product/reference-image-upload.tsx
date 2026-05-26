"use client";

import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { fetchJson } from "@/lib/fetch-json";

const MAX_REFERENCE_IMAGES = 3;

export function ReferenceImageUpload({
  urls,
  onChange,
  disabled,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}) {
  const { toast } = useToast();

  const upload = async (file: File) => {
    if (urls.length >= MAX_REFERENCE_IMAGES) {
      toast(`Maximum ${MAX_REFERENCE_IMAGES} reference images`, "error");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { ok, data } = await fetchJson<{ url?: string; error?: string }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!ok || !data.url) throw new Error(data.error || "Upload failed");
      onChange([...urls, data.url]);
      toast("Reference image added");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    }
  };

  return (
    <div className="space-y-3">
      <Label>Style reference images (optional, max {MAX_REFERENCE_IMAGES})</Label>
      <p className="text-xs text-[var(--muted-fg)]">
        Mood boards, past campaigns, or competitor aesthetics — used for vibe and photography direction, not product
        shape.
      </p>
      {urls.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3">
          {urls.map((url) => (
            <li key={url} className="relative overflow-hidden rounded-xl border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Reference" className="aspect-square w-full object-cover" />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                disabled={disabled}
                onClick={() => onChange(urls.filter((u) => u !== url))}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove reference image</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {urls.length < MAX_REFERENCE_IMAGES ? (
        <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20 p-4 text-center text-sm text-[var(--muted-fg)] hover:border-[var(--accent)]/40">
          {disabled ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="mt-2">Upload reference image</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </label>
      ) : null}
    </div>
  );
}
