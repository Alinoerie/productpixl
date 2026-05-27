"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { StudioPageShell } from "@/components/layout/studio-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STUDIO_ROUTES } from "@/lib/studio-routes";

type SourceProduct = { id: string; name: string; marketplace: string; hasCopy: boolean; hasImages: boolean };

type Variation = { name: string; marketplace: string; colors: string };

const RUN_KINDS = [
  { value: "both", label: "Regenerate images + copy" },
  { value: "copy", label: "Copy only (translations/variations)" },
  { value: "image", label: "Images only" },
] as const;

export function CloneCatalogWorkspace({ products }: { products: SourceProduct[] }) {
  const [sourceProductId, setSourceProductId] = useState(products[0]?.id ?? "");
  const [variations, setVariations] = useState<Variation[]>([
    { name: "", marketplace: "", colors: "" },
  ]);
  const [runKind, setRunKind] = useState<(typeof RUN_KINDS)[number]["value"]>("copy");
  const [cloneListingCopy, setCloneListingCopy] = useState(true);
  const [quote, setQuote] = useState<{ total: number; summary: string; detailLine: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const source = products.find((p) => p.id === sourceProductId);

  useEffect(() => {
    if (source && !variations[0]?.marketplace) {
      setVariations((rows) =>
        rows.map((row, index) => (index === 0 ? { ...row, marketplace: source.marketplace } : row))
      );
    }
  }, [source, variations]);

  async function quoteClone() {
    setStatus("loading");
    setMessage(null);
    const payload = {
      action: "quote",
      sourceProductId,
      runKind,
      cloneListingCopy,
      variations: variations.filter((v) => v.name.trim()),
    };
    const res = await fetch("/api/batch/clone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      error?: string;
      quote?: { total: number; summary: string; detailLine: string };
    };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Could not quote clone batch");
      return;
    }
    setQuote(data.quote ?? null);
    setStatus("idle");
  }

  async function runClone() {
    setStatus("running");
    setMessage(null);
    const res = await fetch("/api/batch/clone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "run",
        sourceProductId,
        runKind,
        cloneListingCopy,
        variations: variations.filter((v) => v.name.trim()),
      }),
    });
    const data = (await res.json()) as {
      error?: string;
      clonedCount?: number;
      creditsCharged?: number;
    };
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "Clone batch failed");
      return;
    }
    setStatus("done");
    setMessage(
      `Created ${data.clonedCount ?? 0} projects · ${data.creditsCharged ?? 0} credits charged.`
    );
  }

  return (
    <StudioPageShell
      eyebrow="Batch"
      title="Clone catalog"
      description="Turn one winning listing into variations or marketplace translations — duplicate the project, then queue copy or image runs."
      guide={{
        step: "Clone wizard",
        title: "1 listing → many SKUs",
        body: "Pick a source project, add variation rows, quote credits, then queue sequential batch runs.",
        actionHref: STUDIO_ROUTES.projects,
        actionLabel: "View projects",
        secondaryHref: "/batch/listing-builder",
        secondaryLabel: "Listing builder",
        variant: "accent",
      }}
    >
      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-serif text-xl">No source projects yet</p>
            <p className="mt-2 text-sm text-[var(--muted-fg)]">
              Complete at least one project before cloning variations or translations.
            </p>
            <Button asChild className="mt-6">
              <Link href={STUDIO_ROUTES.images}>Start image run</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Source project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="source-product">Clone from</Label>
                <select
                  id="source-product"
                  value={sourceProductId}
                  onChange={(e) => setSourceProductId(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.marketplace}
                      {p.hasCopy ? " · copy" : ""}
                      {p.hasImages ? " · images" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">2. Variations</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setVariations((rows) => [
                        ...rows,
                        { name: "", marketplace: source?.marketplace ?? "AMAZON_US", colors: "" },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add row
                  </Button>
                </div>
                {variations.map((row, index) => (
                  <div key={index} className="grid gap-2 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-[1fr_140px_120px_auto]">
                    <Input
                      placeholder="Variation name"
                      value={row.name}
                      onChange={(e) =>
                        setVariations((rows) =>
                          rows.map((r, i) => (i === index ? { ...r, name: e.target.value } : r))
                        )
                      }
                    />
                    <select
                      value={row.marketplace || source?.marketplace || "AMAZON_US"}
                      onChange={(e) =>
                        setVariations((rows) =>
                          rows.map((r, i) => (i === index ? { ...r, marketplace: e.target.value } : r))
                        )
                      }
                      className="h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                    >
                      <option value="AMAZON_US">Amazon US</option>
                      <option value="AMAZON_DE">Amazon DE</option>
                      <option value="BOL_COM">Bol.com</option>
                      <option value="SHOPIFY">Shopify</option>
                    </select>
                    <Input
                      placeholder="Color (optional)"
                      value={row.colors}
                      onChange={(e) =>
                        setVariations((rows) =>
                          rows.map((r, i) => (i === index ? { ...r, colors: e.target.value } : r))
                        )
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label="Remove variation"
                      disabled={variations.length === 1}
                      onClick={() => setVariations((rows) => rows.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Run settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clone-kind">Pipeline</Label>
                <select
                  id="clone-kind"
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
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cloneListingCopy}
                  onChange={(e) => setCloneListingCopy(e.target.checked)}
                />
                Copy existing listing text to clones
              </label>
              {quote ? (
                <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)]/30 p-4 text-sm">
                  <p className="font-semibold">{quote.summary}</p>
                  <p className="mt-1 text-[var(--muted-fg)]">{quote.detailLine}</p>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={status === "loading"}
                onClick={() => void quoteClone()}
              >
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Quote clone batch
              </Button>
              <Button
                type="button"
                className="w-full"
                disabled={!quote || status === "running"}
                onClick={() => void runClone()}
              >
                {status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Run clone batch
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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
