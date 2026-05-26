"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "COMPLETE", label: "Complete" },
  { value: "PROCESSING", label: "Processing" },
  { value: "QUEUED", label: "Queued" },
  { value: "FAILED", label: "Failed" },
] as const;

const COPY_OPTIONS = [
  { value: "", label: "Any copy" },
  { value: "with", label: "Has copy" },
  { value: "without", label: "Missing copy" },
] as const;

const IMAGES_OPTIONS = [
  { value: "", label: "Any images" },
  { value: "with", label: "Has images" },
  { value: "without", label: "Missing images" },
] as const;

const READY_OPTIONS = [{ value: "export", label: "Export-ready" }] as const;

export function buildProjectsQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.copy) q.set("copy", params.copy);
  if (params.images) q.set("images", params.images);
  if (params.ready) q.set("ready", params.ready);
  if (params.q) q.set("q", params.q);
  if (params.page && params.page !== "1") q.set("page", params.page);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function ProjectsFilterBar({
  total,
  filtered,
}: {
  total: number;
  filtered: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const status = searchParams.get("status") ?? "";
  const copy = searchParams.get("copy") ?? "";
  const images = searchParams.get("images") ?? "";
  const ready = searchParams.get("ready") ?? "";
  const q = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(q);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  const push = (next: Record<string, string>) => {
    const merged = {
      status: next.status ?? status,
      copy: next.copy ?? copy,
      images: next.images ?? images,
      ready: next.ready ?? ready,
      q: next.q ?? q,
    };
    startTransition(() => {
      router.push(`/projects${buildProjectsQuery({ ...merged, page: "1" })}`);
    });
  };

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === q) return;
    const timer = window.setTimeout(() => {
      push({ q: trimmed });
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce only when search text changes
  }, [search]);

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted-fg)]">
          Showing <strong className="text-[var(--foreground)]">{filtered}</strong>
          {filtered !== total ? ` of ${total}` : ""} project{filtered === 1 ? "" : "s"}
          {isPending ? (
            <span className="ml-2 inline-flex items-center gap-1 text-[var(--accent)]">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Updating…
            </span>
          ) : null}
        </p>
        {(status || copy || images || ready || q) ? (
          <Link
            href="/projects"
            className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Clear filters
          </Link>
        ) : null}
      </div>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-fg)]" />
        <Input
          name="q"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              push({ q: search.trim() });
            }
          }}
          placeholder="Search by product name…"
          className="pl-9"
          aria-label="Search projects"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value || "all-status"}
            type="button"
            onClick={() => push({ status: opt.value })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              status === opt.value
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            )}
            aria-pressed={status === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {COPY_OPTIONS.map((opt) => (
          <button
            key={opt.value || "all-copy"}
            type="button"
            onClick={() => push({ copy: opt.value })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              copy === opt.value
                ? "bg-[var(--teal)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            )}
            aria-pressed={copy === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {IMAGES_OPTIONS.map((opt) => (
          <button
            key={opt.value || "all-images"}
            type="button"
            onClick={() => push({ images: opt.value })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              images === opt.value
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            )}
            aria-pressed={images === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {READY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              push({
                ready: ready === opt.value ? "" : opt.value,
                copy: ready === opt.value ? copy : "with",
                images: ready === opt.value ? images : "with",
              })
            }
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              ready === opt.value
                ? "bg-[var(--success)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            )}
            aria-pressed={ready === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
