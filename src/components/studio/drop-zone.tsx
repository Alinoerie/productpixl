"use client";

import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDIO_TRANSITION } from "@/lib/studio-motion";

type DropZoneProps = {
  preview?: string;
  fileName?: string;
  fileSize?: string;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
  height?: "sm" | "md" | "lg";
  emptyTitle?: string;
  emptyHint?: string;
  inputId?: string;
  scanning?: boolean;
};

const HEIGHTS = {
  sm: "h-[120px]",
  md: "h-[180px]",
  lg: "h-[240px]",
};

export function DropZone({
  preview,
  fileName,
  fileSize,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onClear,
  disabled,
  height = "lg",
  emptyTitle = "Drop photo or click to browse",
  emptyHint = "JPG, PNG or WEBP · max 20MB",
  inputId = "studio-dropzone",
  scanning = false,
}: DropZoneProps) {
  const compact = Boolean(preview);

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "group relative flex cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all",
          STUDIO_TRANSITION.micro,
          compact ? "h-[120px] flex-row items-center gap-4 px-4" : cn("flex-col items-center justify-center p-6", HEIGHTS[height]),
          dragOver
            ? "border-[var(--brand-primary,var(--accent))] bg-[var(--accent-soft)]/40"
            : preview
              ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]/15"
              : "border-[var(--border)] bg-[var(--muted)]/30 hover:border-[var(--accent)]/60 hover:bg-[var(--accent-soft)]/20",
          disabled && "pointer-events-none opacity-60",
          !compact && "studio-dash-animate"
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className={cn("rounded-lg object-contain", compact ? "h-20 w-20 shrink-0" : "max-h-40")} />
            {compact ? (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">{fileName ?? "Product photo"}</p>
                {fileSize ? <p className="text-xs text-[var(--muted-fg)]">{fileSize}</p> : null}
              </div>
            ) : null}
            {onClear ? (
              <button
                type="button"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] shadow ring-1 ring-[var(--border)]"
                onClick={(e) => {
                  e.preventDefault();
                  onClear();
                }}
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {scanning ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="studio-scan-line absolute inset-x-0 h-1 bg-[var(--accent)]/60" />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card)] shadow-[var(--shadow-sm)]">
              <Upload className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-center font-medium">{emptyTitle}</p>
            <p className="mt-1 text-center text-sm text-[var(--muted-fg)]">{emptyHint}</p>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        />
      </label>
    </div>
  );
}
