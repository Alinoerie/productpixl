"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "productpixl-brand-nudge-dismissed";

export function BrandSetupNudge({ configured }: { configured: boolean }) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (configured || hidden) return null;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/30 px-4 py-3.5">
      <div className="flex min-w-0 gap-3">
        <Palette className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
        <div>
          <p className="text-sm font-semibold">Set your brand once</p>
          <p className="mt-0.5 text-sm text-[var(--muted-fg)]">
            Colors and tone feed every image run — consistent gallery shots without repeating yourself.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button asChild size="sm">
          <Link href="/brand">Set up brand</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Dismiss brand setup reminder"
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, "1");
            setHidden(true);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
