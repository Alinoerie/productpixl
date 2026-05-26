"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-6 py-16 text-center">
      <h1 className="font-serif text-2xl">Something went wrong</h1>
      <p className="text-sm text-[var(--muted-fg)]">
        The studio hit an unexpected error. Your projects are still saved — try again or return to the
        dashboard.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to studio</Link>
        </Button>
      </div>
    </div>
  );
}
