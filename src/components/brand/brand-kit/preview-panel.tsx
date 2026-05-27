"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BrandListingPreview } from "@/components/brand/brand-listing-preview";

type PreviewProfile = {
  displayName?: string | null;
  tagline?: string | null;
  tone: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  targetAudience?: string | null;
  brandStory?: string | null;
  language?: string;
};

export function BrandKitPreviewPanel({
  profile,
  complete,
  checklist,
  className,
}: {
  profile: PreviewProfile;
  complete: boolean;
  checklist: { label: string; done: boolean }[];
  className?: string;
}) {
  const [tab, setTab] = useState<"listing" | "image">("listing");
  const name = profile.displayName?.trim() || "Your brand";

  return (
    <div
      className={cn("flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)]", className)}
      style={{
        ["--brand-primary" as string]: profile.primaryColor,
        ["--brand-secondary" as string]: profile.secondaryColor,
      }}
    >
      <div
        className="h-1 rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${profile.primaryColor}, ${profile.secondaryColor})`,
        }}
      />
      <div className="flex border-b border-[var(--border)] p-1">
        {(
          [
            ["listing", "Listing card"],
            ["image", "Image module"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              tab === id ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tab === "listing" ? (
          <BrandListingPreview profile={profile} complete={complete} checklist={checklist} />
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-fg)]">
              Hero module preview
            </p>
            <div
              className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)]"
              style={{
                background: `linear-gradient(145deg, ${profile.primaryColor}22, ${profile.secondaryColor}33)`,
              }}
            >
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logoUrl} alt="" className="absolute left-1/2 top-1/2 max-h-[40%] max-w-[60%] -translate-x-1/2 -translate-y-1/2 object-contain" />
              ) : (
                <div
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl text-xl font-bold text-white shadow-md"
                  style={{ backgroundColor: profile.primaryColor }}
                >
                  {name.charAt(0)}
                </div>
              )}
              <span
                className="absolute bottom-3 right-3 h-3 w-3 rounded-full ring-2 ring-white"
                style={{ backgroundColor: profile.primaryColor }}
                title="Primary color dot"
              />
              <div
                className="absolute bottom-3 left-3 rounded-md px-2 py-1 text-[10px] font-semibold text-white"
                style={{ backgroundColor: profile.secondaryColor }}
              >
                EU ready
              </div>
            </div>
            <p className="text-xs text-[var(--muted-fg)]">
              Colors and logo apply to lifestyle, hero, and infographic modules on your next image run.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
