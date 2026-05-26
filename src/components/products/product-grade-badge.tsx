"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { GRADE_UPDATED_EVENT, getProductGrade } from "@/lib/grade-session";

export function ProductGradeBadge({
  productId,
  initialGrade,
  initialScore,
}: {
  productId: string;
  initialGrade?: string | null;
  initialScore?: number | null;
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

  return (
    <Badge variant="secondary" className="bg-[var(--success-bg)] text-[var(--success)]">
      Graded {grade}
      {score != null ? ` · ${score}` : ""}
    </Badge>
  );
}
