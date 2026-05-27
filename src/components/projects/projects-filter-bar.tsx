"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useRef } from "react";
import { Loader2, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
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

const PIPELINE_OPTIONS = [
  { value: "", label: "Any pipeline" },
  { value: "LISTING", label: "Listing" },
  { value: "COPY", label: "Copy" },
  { value: "APLUS", label: "A+" },
  { value: "VIDEO", label: "Video" },
] as const;

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Last Updated" },
  { value: "createdAt", label: "Date Created" },
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
] as const;

type SortField = "updatedAt" | "createdAt" | "name" | "status";

function SortIcon({ field, currentSort, currentOrder }: { field: SortField; currentSort: string; currentOrder: string }) {
  if (currentSort !== field) {
    return <ChevronsUpDown className="h-3 w-3 inline-block ml-1 opacity-40" />;
  }
  return currentOrder === "asc"
    ? <ChevronUp className="h-3 w-3 inline-block ml-1" />
    : <ChevronDown className="h-3 w-3 inline-block ml-1" />;
}

function SearchableSlugSelect({
  label,
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  "aria-label": string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputId = `slug-${label.replace(/\s+/g, "-").toLowerCase()}`;

  // All possible options would come from the server; here we show a text input
  // that acts as a searchable filter. When open=true we show a dropdown-like list.
  const displayValue = value ? value : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-left transition-colors",
          value ? "text-[var(--foreground)]" : "text-[var(--muted-fg)]",
          open && "ring-2 ring-[var(--accent)]"
        )}
        aria-label={ariaLabel}
        id={inputId}
      >
        <span className="flex-1 truncate">
          {value ? `${label}: ${value}` : placeholder}
        </span>
        <ChevronsUpDown className="h-3 w-3 flex-shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)]">
          <div className="p-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="h-7 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setSearch("");
                }
              }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-xs text-left hover:bg-[var(--muted)]",
                !value && "font-medium text-[var(--accent)]"
              )}
            >
              All {label}s
            </button>
            {search.trim() && (
              <button
                type="button"
                onClick={() => {
                  onChange(search.trim());
                  setOpen(false);
                  setSearch("");
                }}
                className="flex w-full items-center px-3 py-1.5 text-xs text-left text-[var(--accent)] hover:bg-[var(--muted)]"
              >
                Use: &ldquo;{search.trim()}&rdquo;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function buildProjectsQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  if (params.brandId) q.set("brandId", params.brandId);
  if (params.status) q.set("status", params.status);
  if (params.copy) q.set("copy", params.copy);
  if (params.images) q.set("images", params.images);
  if (params.ready) q.set("ready", params.ready);
  if (params.q) q.set("q", params.q);
  if (params.pipelineType) q.set("pipelineType", params.pipelineType);
  if (params.playbookSlug) q.set("playbookSlug", params.playbookSlug);
  if (params.templateSlug) q.set("templateSlug", params.templateSlug);
  if (params.page && params.page !== "1") q.set("page", params.page);
  if (params.sort) q.set("sort", params.sort);
  if (params.order) q.set("order", params.order);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type ProjectsBrandFilter = { id: string; name: string; isActive?: boolean };

export function ProjectsFilterBar({
  total,
  filtered,
  brands = [],
  activeBrandId,
}: {
  total: number;
  filtered: number;
  brands?: ProjectsBrandFilter[];
  activeBrandId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const brandId = searchParams.get("brandId") ?? "";
  const status = searchParams.get("status") ?? "";
  const copy = searchParams.get("copy") ?? "";
  const images = searchParams.get("images") ?? "";
  const ready = searchParams.get("ready") ?? "";
  const pipelineType = searchParams.get("pipelineType") ?? "";
  const playbookSlug = searchParams.get("playbookSlug") ?? "";
  const templateSlug = searchParams.get("templateSlug") ?? "";
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "updatedAt";
  const order = searchParams.get("order") ?? "desc";
  const [search, setSearch] = useState(q);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  const push = (next: Record<string, string>) => {
    const merged = {
      brandId: next.brandId ?? brandId,
      status: next.status ?? status,
      copy: next.copy ?? copy,
      images: next.images ?? images,
      ready: next.ready ?? ready,
      pipelineType: next.pipelineType ?? pipelineType,
      playbookSlug: next.playbookSlug ?? playbookSlug,
      templateSlug: next.templateSlug ?? templateSlug,
      q: next.q ?? q,
      sort: next.sort ?? sort,
      order: next.order ?? order,
    };
    startTransition(() => {
      router.push(`/projects${buildProjectsQuery({ ...merged, page: "1" })}`);
    });
  };

  const toggleSort = (field: SortField) => {
    if (sort === field) {
      push({ order: order === "asc" ? "desc" : "asc" });
    } else {
      push({ sort: field, order: "asc" });
    }
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
        {(brandId || status || copy || images || ready || pipelineType || playbookSlug || templateSlug || q) ? (
          <Link
            href="/projects"
            className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Clear filters
          </Link>
        ) : null}
      </div>
      {brands.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => push({ brandId: "" })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              !brandId
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            )}
            aria-pressed={!brandId}
          >
            All brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => push({ brandId: brand.id })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                brandId === brand.id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
              )}
              aria-pressed={brandId === brand.id}
            >
              {brand.name}
              {brand.id === activeBrandId ? " · active" : ""}
            </button>
          ))}
        </div>
      ) : null}
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
      <div className="flex flex-wrap gap-2">
        {PIPELINE_OPTIONS.map((opt) => (
          <button
            key={opt.value || "all-pipeline"}
            type="button"
            onClick={() => push({ pipelineType: opt.value })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              pipelineType === opt.value
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            )}
            aria-pressed={pipelineType === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SearchableSlugSelect
          label="Playbook"
          value={playbookSlug}
          onChange={(v) => push({ playbookSlug: v })}
          placeholder="Filter by playbook…"
          aria-label="Filter by playbook slug"
        />
        <SearchableSlugSelect
          label="Template"
          value={templateSlug}
          onChange={(v) => push({ templateSlug: v })}
          placeholder="Filter by template…"
          aria-label="Filter by template slug"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
        <span className="text-xs text-[var(--muted-fg)]">Sort by:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleSort(opt.value as SortField)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              sort === opt.value
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            )}
            aria-pressed={sort === opt.value}
          >
            {opt.label}
            <SortIcon field={opt.value as SortField} currentSort={sort} currentOrder={order} />
          </button>
        ))}
      </div>
    </div>
  );
}
