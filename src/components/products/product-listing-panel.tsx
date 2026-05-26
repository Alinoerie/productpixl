"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AMAZON_TITLE_MAX, charCountLabel } from "@/lib/amazon-limits";
import { cn } from "@/lib/utils";

export function ProductListingPanel({
  title,
  bullets,
  description,
  keywords,
}: {
  title: string;
  bullets: string[];
  description?: string | null;
  keywords?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const titleCount = charCountLabel(title, AMAZON_TITLE_MAX);

  const copyAll = async () => {
    const text = [
      title,
      "",
      ...bullets.map((b, i) => `${i + 1}. ${b}`),
      "",
      description ?? "",
      "",
      `Keywords: ${keywords ?? ""}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl">Listing copy</h2>
        <Button type="button" variant="outline" size="sm" onClick={copyAll}>
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy all
            </>
          )}
        </Button>
      </div>
      {titleCount.over && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Title is over Amazon&apos;s {AMAZON_TITLE_MAX}-character limit.
        </p>
      )}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{title}</CardTitle>
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
              titleCount.over ? "font-medium text-red-600" : "text-[var(--muted-fg)]"
            )}
          >
            {titleCount.label}
          </span>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ul className="space-y-2">
            {bullets.map((b, i) => (
              <li key={`bullet-${i}-${b.slice(0, 12)}`} className="flex gap-2">
                <span className="shrink-0 font-semibold text-[var(--accent)]">{i + 1}.</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {description ? (
            <p className="whitespace-pre-wrap border-t border-[var(--border)] pt-4 text-[var(--muted-fg)]">
              {description}
            </p>
          ) : null}
          {keywords ? (
            <p className="rounded-lg bg-[var(--muted)]/50 px-3 py-2 text-xs">
              <strong className="text-[var(--foreground)]">Backend keywords:</strong> {keywords}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
