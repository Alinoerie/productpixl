"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { GradeListingButton } from "@/components/products/grade-listing-button";
import { GRADE_UPDATED_EVENT, getProductGrade } from "@/lib/grade-session";
import type { CopyDraft } from "@/lib/copy-draft";

export function ProductGradeBadge({
  productId,
  initialGrade,
  initialScore,
  listingCopy,
}: {
  productId: string;
  initialGrade?: string | null;
  initialScore?: number | null;
  listingCopy?: CopyDraft | null;
}) {
  const [grade, setGrade] = useState(initialGrade);
  const [score, setScore] = useState(initialScore);

  useEffect(() => {
    setGrade(initialGrade);
    setScore(initialScore);
  }, [initialGrade, initialScore]);

  useEffect(() => {
    const apply = (snapshot?: { grade?: string; score?: number }) => {
      if (snapshot?.grade) setGrade(snapshot.grade);
      if (snapshot?.score != null) setScore(snapshot.score);
    };

    const stored = getProductGrade(productId);
    if (stored?.grade && !initialGrade) apply(stored);

    const onGrade = (event: Event) => {
      const detail = (event as CustomEvent<{ productId?: string; grade?: string; score?: number }>).detail;
      if (detail?.productId !== productId) return;
      apply(detail);
    };

    window.addEventListener(GRADE_UPDATED_EVENT, onGrade);
    return () => window.removeEventListener(GRADE_UPDATED_EVENT, onGrade);
  }, [productId, initialGrade]);

  if (!grade) return null;

  const label = `Graded ${grade}${score != null ? ` · ${score}` : ""}`;

  if (listingCopy?.title) {
    return (
      <GradeListingButton
        productId={productId}
        listingCopy={{ ...listingCopy, productId }}
        variant="secondary"
        size="sm"
        className="h-7 gap-1 bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success-bg)]/80"
      >
        {label}
        <span className="hidden sm:inline">· Review tips</span>
        <span className="sr-only">Open grader tips</span>
      </GradeListingButton>
    );
  }

  return (
    <Badge variant="secondary" className="bg-[var(--success-bg)] text-[var(--success)]">
      {label}
    </Badge>
  );
}
