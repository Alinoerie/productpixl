"use client";

import { useEffect } from "react";
import Link from "next/link";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { Button } from "@/components/ui/button";

export default function ProductError({
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
      <h1 className="font-serif text-2xl">Couldn&apos;t load this project</h1>
      <p className="text-sm text-[var(--muted-fg)]">
        Something went wrong while loading your project. Your images and listing copy are still saved —
        try again or return to your project list.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href={STUDIO_ROUTES.projects}>All projects</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={STUDIO_ROUTES.home}>Back to studio</Link>
        </Button>
      </div>
    </div>
  );
}
