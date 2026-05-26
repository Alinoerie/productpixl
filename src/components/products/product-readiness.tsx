"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { isProductGraded, getProductGrade, GRADE_UPDATED_EVENT } from "@/lib/grade-session";
import { cn } from "@/lib/utils";

export function ProductReadiness({
  productId,
  imageCount,
  hasCopy,
  listingCopy,
  status,
  grade,
  gradeScore,
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
  grade?: string | null;
  gradeScore?: number | null;
}) {
  const hasImages = imageCount > 0;
  const readyToExport = hasImages && hasCopy;
  const [sessionGraded, setSessionGraded] = useState(false);
  const [sessionGrade, setSessionGrade] = useState<string | null>(null);
  const [sessionScore, setSessionScore] = useState<number | null>(null);
  const isGraded = Boolean(grade) || sessionGraded;

  useEffect(() => {
    const refresh = () => {
      setSessionGraded(isProductGraded(productId));
      const snapshot = getProductGrade(productId);
      if (snapshot) {
        setSessionGrade(snapshot.grade);
        setSessionScore(snapshot.score);
      }
    };
    refresh();
    const onGrade = (event: Event) => {
      const detail = (event as CustomEvent<{ productId?: string; grade?: string; score?: number }>).detail;
      if (!detail?.productId || detail.productId === productId) {
        refresh();
        if (detail.grade) setSessionGrade(detail.grade);
        if (detail.score != null) setSessionScore(detail.score);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener(GRADE_UPDATED_EVENT, onGrade);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(GRADE_UPDATED_EVENT, onGrade);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [productId]);

  const displayGrade = grade ?? sessionGrade;
  const displayScore = gradeScore ?? sessionScore;
  const gradeLabel =
    displayGrade && displayScore != null
      ? `Graded · ${displayGrade} (${displayScore})`
      : displayGrade
        ? `Graded · ${displayGrade}`
        : "Grade listing";

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
      label: gradeLabel,
      done: isGraded,
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
      id="readiness"
      aria-label="Listing readiness"
      className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 md:p-5"
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
                    className="h-auto gap-2 rounded-full border-[var(--success-border)] bg-[var(--success-bg)] px-3 py-2 text-xs font-medium hover:bg-[var(--success-bg)]"
                  >
                    <Check className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={2.5} />
                    {gradeLabel}
                    <span className="text-[var(--accent)]">· Review tips</span>
                  </GradeListingButton>
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
