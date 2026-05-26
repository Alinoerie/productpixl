"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  preview?: string;
  previewAlt?: string;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
  minHeight?: string;
  emptyTitle?: string;
  emptyHint?: string;
  inputId?: string;
};

export function UploadDropzone({
  preview,
  previewAlt = "Uploaded product preview",
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onClear,
  disabled,
  minHeight = "min-h-[200px]",
  emptyTitle = "Drop photo or click to browse",
  emptyHint = "JPG, PNG or WEBP · max 20MB",
  inputId = "product-upload",
}: UploadDropzoneProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors",
          minHeight,
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent-soft)]/50"
            : preview
              ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]/20"
              : "border-[var(--border)] bg-[var(--muted)]/40 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/20",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={previewAlt}
              className="max-h-56 rounded-xl object-contain shadow-[var(--shadow-md)]"
            />
            <span className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-[var(--ink)]/75 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Click or drop to replace photo
            </span>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card)] shadow-[var(--shadow-sm)]">
              <Upload className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <p className="mt-4 font-medium">{emptyTitle}</p>
            <p className="mt-1 text-sm text-[var(--muted-fg)]">{emptyHint}</p>
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
      {preview && onClear ? (
        <button
          type="button"
          className="text-xs font-medium text-[var(--muted-fg)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
          onClick={onClear}
          disabled={disabled}
        >
          Remove photo
        </button>
      ) : null}
    </div>
  );
}
