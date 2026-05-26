"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "COMPLETE", label: "Complete" },
  { value: "PROCESSING", label: "Processing" },
  { value: "FAILED", label: "Failed" },
] as const;

const COPY_OPTIONS = [
  { value: "", label: "Any copy" },
  { value: "with", label: "Has copy" },
  { value: "without", label: "Missing copy" },
] as const;

export function buildProjectsQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.copy) q.set("copy", params.copy);
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
  const status = searchParams.get("status") ?? "";
  const copy = searchParams.get("copy") ?? "";
  const q = searchParams.get("q") ?? "";

  const push = (next: Record<string, string>) => {
    const merged = {
      status: next.status ?? status,
      copy: next.copy ?? copy,
      q: next.q ?? q,
    };
    router.push(`/projects${buildProjectsQuery({ ...merged, page: "1" })}`);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted-fg)]">
          Showing <strong className="text-[var(--foreground)]">{filtered}</strong>
          {filtered !== total ? ` of ${total}` : ""} project{filtered === 1 ? "" : "s"}
        </p>
        {(status || copy || q) ? (
          <Link
            href="/projects"
            className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Clear filters
          </Link>
        ) : null}
      </div>
      <form
        className="relative max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          push({ q: String(fd.get("q") ?? "").trim() });
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-fg)]" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by product name…"
          className="pl-9"
          aria-label="Search projects"
        />
      </form>
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
    </div>
  );
}
