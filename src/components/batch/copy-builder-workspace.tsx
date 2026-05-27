"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Upload, Clock } from "lucide-react";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { parseCsvText, type CsvColumnMap } from "@/lib/batch/csv";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

const COPY_FIELD_OPTIONS = [
  { key: "name", label: "Product name", required: true },
  { key: "category", label: "Category", required: false },
  { key: "materials", label: "Materials", required: false },
  { key: "colors", label: "Colors", required: false },
  { key: "keyFeatures", label: "Key features", required: false },
  { key: "targetBuyer", label: "Target buyer", required: false },
  { key: "competitors", label: "Competitors", required: false },
  { key: "vibe", label: "Vibe", required: false },
  { key: "useCase", label: "Use case", required: false },
  { key: "differentiators", label: "Differentiators", required: false },
  { key: "dimensions", label: "Dimensions", required: false },
] as const;

type CopyCsvColumnMap = {
  name: string;
  category?: string;
  marketplace?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  dimensions?: string;
};

function getOffPeakTimes(): { label: string; value: string }[] {
  const times: { label: string; value: string }[] = [];
  const now = new Date();

  for (let dayOffset = 1; dayOffset <= 1; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(2, 0, 0, 0); // 2 AM

    for (const hour of [2, 3, 4]) {
      const d = new Date(targetDate);
      d.setHours(hour, 0, 0, 0);
      if (d > now) {
        const label = d.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        times.push({ label, value: d.toISOString() });
      }
    }
    break; // Only tomorrow's times
  }

  // If all times have passed for tomorrow, add a generic "tomorrow 2AM" for the next available day
  if (times.length === 0) {
    const next2AM = new Date(now);
    next2AM.setDate(next2AM.getDate() + 1);
    next2AM.setHours(2, 0, 0, 0);
    times.push({
      label: next2AM.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      value: next2AM.toISOString(),
    });
  }

  return times;
}

export function CopyBuilderWorkspace() {
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<CopyCsvColumnMap>({ name: "" });
  const [marketplace, setMarketplace] = useState("AMAZON_US");
  const [quote, setQuote] = useState<{ total: number; summary: string; detailLine: string } | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "done" | "error" | "scheduled">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState<string>("");

  const offPeakTimes = useMemo(() => getOffPeakTimes(), []);

  const previewRows = useMemo(() => parseCsvText(csvText).rows.slice(0, 3), [csvText]);

  async function handleFile(file: File) {
    const text = await file.text();
    setCsvText(text);
    const parsed = parseCsvText(text);
    setHeaders(parsed.headers);
    setColumnMap({
      name: parsed.headers.find((h) => /name|title|product/i.test(h)) ?? parsed.headers[0] ?? "",
      category: parsed.headers.find((h) => /category/i.test(h)) ?? "",
      materials: parsed.headers.find((h) => /materials/i.test(h)) ?? "",
      colors: parsed.headers.find((h) => /colors/i.test(h)) ?? "",
      keyFeatures: parsed.headers.find((h) => /features|key features/i.test(h)) ?? "",
      targetBuyer: parsed.headers.find((h) => /target|buyer/i.test(h)) ?? "",
      competitors: parsed.headers.find((h) => /competitors/i.test(h)) ?? "",
      vibe: parsed.headers.find((h) => /vibe/i.test(h)) ?? "",
      useCase: parsed.headers.find((h) => /use.?case/i.test(h)) ?? "",
      differentiators: parsed.headers.find((h) => /differentiators/i.test(h)) ?? "",
      dimensions: parsed.headers.find((h) => /dimensions/i.test(h)) ?? "",
    });
    setMessage(null);
    setQuote(null);
  }

  async function validateAndQuote() {
    setStatus("loading");
    setMessage(null);
    const res = await fetch("/api/batch/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "quote", csvText, columnMap, marketplace }),
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
    const res = await fetch("/api/batch/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run", csvText, columnMap, marketplace }),
    });
    const data = (await res.json()) as { error?: string; rowCount?: number; creditsCharged?: number };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Batch failed to start");
      return;
    }
    setStatus("done");
    setMessage(
      `Queued ${data.rowCount ?? 0} copy projects · ${data.creditsCharged ?? 0} credits charged. Track progress in Projects.`
    );
  }

  async function scheduleBatch() {
    if (!scheduleTime) return;
    setStatus("loading");
    setMessage(null);
    const res = await fetch("/api/batch/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "schedule", csvText, columnMap, marketplace, scheduleAt: scheduleTime }),
    });
    const data = (await res.json()) as { error?: string; scheduledJobId?: string; runAt?: string; message?: string };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Failed to schedule batch");
      return;
    }
    setStatus("scheduled");
    setShowSchedule(false);
    setMessage(data.message ?? "Batch scheduled successfully");
  }

  return (
    <StudioPageShell
      eyebrow="Batch"
      title="Copy builder"
      description="Upload a CSV with product details and generate marketplace listing copy in bulk."
      guide={{
        step: "Batch copy",
        title: "Generate copy for your whole catalog",
        body: "Each row becomes a copy generation project. Copy is tailored to the marketplace you select.",
        actionHref: STUDIO_ROUTES.projects,
        actionLabel: "View projects",
        secondaryHref: "/batch/listing-builder",
        secondaryLabel: "Listing builder",
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

            {/* Schedule toggle */}
            {!showSchedule ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start text-[var(--muted-fg)]"
                onClick={() => {
                  setShowSchedule(true);
                  if (offPeakTimes.length > 0 && !scheduleTime) {
                    setScheduleTime(offPeakTimes[0]!.value);
                  }
                }}
              >
                <Clock className="h-4 w-4" />
                Schedule for off-peak time
              </Button>
            ) : (
              <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/10 p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-sm font-medium">Schedule batch run</span>
                </div>
                <p className="text-xs text-[var(--muted-fg)]">
                  Off-peak times run when server load is lowest — often faster completion.
                </p>
                <select
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                >
                  {offPeakTimes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowSchedule(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={!scheduleTime || status === "loading"}
                    onClick={() => void scheduleBatch()}
                  >
                    {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Schedule
                  </Button>
                </div>
              </div>
            )}

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
              disabled={!quote || status === "running" || showSchedule}
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
            {COPY_FIELD_OPTIONS.map((field) => (
              <div key={field.key}>
                <Label>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                <select
                  value={columnMap[field.key as keyof CopyCsvColumnMap] ?? ""}
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
              : status === "scheduled"
              ? "border border-[var(--accent)]/30 bg-[var(--accent-soft)]/30 text-[var(--accent)]"
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
