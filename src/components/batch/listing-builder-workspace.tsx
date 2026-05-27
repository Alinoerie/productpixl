"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Upload } from "lucide-react";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LISTING_BUILDER_FIELD_OPTIONS, parseCsvText, type CsvColumnMap } from "@/lib/batch/csv";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

const RUN_KINDS = [
  { value: "both", label: "Images + copy" },
  { value: "image", label: "Images only" },
  { value: "copy", label: "Copy only" },
] as const;

export function ListingBuilderWorkspace() {
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<CsvColumnMap>({ name: "", inputImageUrl: "" });
  const [marketplace, setMarketplace] = useState("AMAZON_US");
  const [runKind, setRunKind] = useState<(typeof RUN_KINDS)[number]["value"]>("both");
  const [quote, setQuote] = useState<{ total: number; summary: string; detailLine: string } | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const previewRows = useMemo(() => parseCsvText(csvText).rows.slice(0, 3), [csvText]);

  async function handleFile(file: File) {
    const text = await file.text();
    setCsvText(text);
    const parsed = parseCsvText(text);
    setHeaders(parsed.headers);
    setColumnMap({
      name: parsed.headers.find((h) => /name|title|product/i.test(h)) ?? parsed.headers[0] ?? "",
      inputImageUrl: parsed.headers.find((h) => /image|url|photo/i.test(h)) ?? parsed.headers[1] ?? "",
      category: parsed.headers.find((h) => /category/i.test(h)) ?? "",
    });
    setMessage(null);
    setQuote(null);
  }

  async function validateAndQuote() {
    setStatus("loading");
    setMessage(null);
    const res = await fetch("/api/batch/listing-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "quote", csvText, columnMap, marketplace, runKind }),
    });
    const data = (await res.json()) as {
      error?: string;
      quote?: { total: number; summary: string; detailLine: string };
      rowCount?: number;
      errors?: string[];
    };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Could not quote batch");
      setErrors(data.errors ?? []);
      return;
    }
    setQuote(data.quote ?? null);
    setRowCount(data.rowCount ?? 0);
    setErrors(data.errors ?? []);
    setStatus("idle");
  }

  async function runBatch() {
    setStatus("running");
    setMessage(null);
    const res = await fetch("/api/batch/listing-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run", csvText, columnMap, marketplace, runKind }),
    });
    const data = (await res.json()) as { error?: string; rowCount?: number; creditsCharged?: number };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Batch failed to start");
      return;
    }
    setStatus("done");
    setMessage(
      `Queued ${data.rowCount ?? 0} projects · ${data.creditsCharged ?? 0} credits charged. Track progress in Projects.`
    );
  }

  return (
    <StudioPageShell
      eyebrow="Batch"
      title="Listing builder"
      description="Upload a catalog CSV, map columns, review the credit quote, and queue image and copy runs for every SKU."
      guide={{
        step: "Batch intake",
        title: "Quote the whole catalog before you run",
        body: "Each row becomes a project. Runs process sequentially with rate limits to protect quality.",
        actionHref: STUDIO_ROUTES.projects,
        actionLabel: "View projects",
        secondaryHref: "/batch/clone",
        secondaryLabel: "Clone catalog",
        variant: "accent",
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Upload CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20 px-6 py-10 text-center">
              <Upload className="h-8 w-8 text-[var(--accent)]" />
              <span className="mt-3 text-sm font-medium">Drop catalog CSV or click to browse</span>
              <span className="mt-1 text-xs text-[var(--muted-fg)]">Up to 50 rows per batch</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </label>
            {headers.length > 0 ? (
              <p className="text-sm text-[var(--muted-fg)]">
                Detected {headers.length} columns · {parseCsvText(csvText).rows.length} rows
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Run settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="run-kind">Pipeline</Label>
              <select
                id="run-kind"
                value={runKind}
                onChange={(e) => setRunKind(e.target.value as typeof runKind)}
                className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                {RUN_KINDS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="marketplace">Default marketplace</Label>
              <select
                id="marketplace"
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <option value="AMAZON_US">Amazon US</option>
                <option value="BOL_COM">Bol.com</option>
                <option value="SHOPIFY">Shopify</option>
                <option value="AMAZON_DE">Amazon DE</option>
              </select>
            </div>
            {quote ? (
              <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)]/30 p-4 text-sm">
                <p className="font-semibold">{quote.summary}</p>
                <p className="mt-1 text-[var(--muted-fg)]">{quote.detailLine}</p>
                <p className="mt-2 text-xs text-[var(--muted-fg)]">{rowCount} projects queued</p>
              </div>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!csvText || status === "loading"}
              onClick={() => void validateAndQuote()}
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Quote batch
            </Button>
            <Button
              type="button"
              className="w-full"
              disabled={!quote || status === "running"}
              onClick={() => void runBatch()}
            >
              {status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Run batch
            </Button>
          </CardContent>
        </Card>
      </div>

      {headers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Map columns</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LISTING_BUILDER_FIELD_OPTIONS.map((field) => (
              <div key={field.key}>
                <Label>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                <select
                  value={columnMap[field.key as keyof CsvColumnMap] ?? ""}
                  onChange={(e) =>
                    setColumnMap((prev) => ({ ...prev, [field.key]: e.target.value || undefined }))
                  }
                  className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                >
                  <option value="">— skip —</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {previewRows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto text-xs">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="border-b px-2 py-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    {headers.map((_, j) => (
                      <td key={j} className="border-b px-2 py-2 text-[var(--muted-fg)]">
                        {row[j] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {errors.length > 0 ? (
        <Card className="border-[var(--error)]/30">
          <CardContent className="space-y-1 p-4 text-sm text-[var(--error)]">
            {errors.map((err) => (
              <p key={err}>{err}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {message ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            status === "error"
              ? "border border-[var(--error)]/30 bg-[var(--error)]/5 text-[var(--error)]"
              : "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
          }`}
          role="status"
        >
          {message}{" "}
          {status === "done" ? (
            <Link href={STUDIO_ROUTES.projects} className="font-medium underline-offset-2 hover:underline">
              Open projects
            </Link>
          ) : null}
        </p>
      ) : null}
    </StudioPageShell>
  );
}
