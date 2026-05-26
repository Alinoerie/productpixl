"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { isProductGraded } from "@/lib/grade-session";
import { cn } from "@/lib/utils";

export function ProductReadiness({
  productId,
  imageCount,
  hasCopy,
  listingCopy,
  status,
}: {
  productId: string;
  imageCount: number;
  hasCopy: boolean;
  listingCopy: {
    title: string;
    bullets: string[];
    description?: string | null;
    backendKeywords?: string | null;
  } | null;
  status: string;
}) {
  const hasImages = imageCount > 0;
  const readyToExport = hasImages && hasCopy;
  const [graded, setGraded] = useState(false);

  useEffect(() => {
    setGraded(isProductGraded(productId));
  }, [productId]);

  const steps = [
    {
      key: "images",
      label: "Gallery images",
      done: hasImages && status !== "FAILED",
      pending: status === "PROCESSING",
      href: status === "FAILED" || !hasImages ? `/generate?productId=${productId}` : undefined,
      cta: status === "FAILED" ? "Retry" : hasImages ? undefined : "Generate",
    },
    {
      key: "copy",
      label: "Listing copy",
      done: hasCopy,
      href: hasCopy ? undefined : `/copy?productId=${productId}`,
      cta: hasCopy ? undefined : "Write copy",
    },
    {
      key: "grade",
      label: "Grade listing",
      done: graded,
      showWhen: hasCopy,
      isGrade: true,
    },
    {
      key: "export",
      label: "Export",
      done: readyToExport,
      href: readyToExport ? `#export` : undefined,
      cta: readyToExport ? "Download" : undefined,
    },
  ].filter((s) => s.showWhen !== false);

  return (
    <section
      aria-label="Listing readiness"
      className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 md:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Listing readiness</p>
        <p className="text-xs text-[var(--muted-fg)]">
          {readyToExport ? "Ready to export" : "Complete each step before publishing"}
        </p>
      </div>
      <ol className="mt-4 flex flex-wrap gap-3">
        {steps.map((step) => {
          const Icon = step.done ? Check : Circle;
          const content = (
            <>
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  step.done ? "text-[var(--success)]" : "text-[var(--muted-fg)]"
                )}
                strokeWidth={step.done ? 2.5 : 1.5}
              />
              <span className={step.done ? "text-[var(--foreground)]" : "text-[var(--muted-fg)]"}>
                {step.label}
                {step.pending ? " (running…)" : ""}
              </span>
              {step.cta ? (
                <span className="text-[var(--accent)] underline-offset-2 group-hover:underline">
                  · {step.cta}
                </span>
              ) : null}
            </>
          );

          if (step.isGrade && listingCopy) {
            if (step.done) {
              return (
                <li
                  key={step.key}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-3 py-2 text-xs font-medium"
                >
                  <Check className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={2.5} />
                  <span className="text-[var(--foreground)]">Grade listing</span>
                </li>
              );
            }
            return (
              <li key={step.key}>
                <GradeListingButton
                  productId={productId}
                  listingCopy={{
                    title: listingCopy.title,
                    bullets: listingCopy.bullets,
                    description: listingCopy.description ?? undefined,
                    backendKeywords: listingCopy.backendKeywords ?? undefined,
                    productId,
                  }}
                  variant="outline"
                  size="sm"
                  className="h-auto gap-2 rounded-full px-3 py-2 text-xs font-medium"
                >
                  <Circle className="h-4 w-4 text-[var(--muted-fg)]" strokeWidth={1.5} />
                  Grade listing
                </GradeListingButton>
              </li>
            );
          }

          if (step.href) {
            return (
              <li key={step.key}>
                <Link
                  href={step.href}
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-medium transition-colors hover:border-[var(--accent)]/40"
                >
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li
              key={step.key}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium",
                step.done
                  ? "border-[var(--success-border)] bg-[var(--success-bg)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-fg)]"
              )}
            >
              {content}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
