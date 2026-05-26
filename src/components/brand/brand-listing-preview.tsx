import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

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

function sampleBullet(tone: string, index: number): string {
  const base = tone.split(",")[0]?.trim() || "Premium";
  const bullets = [
    `${base.charAt(0).toUpperCase()}${base.slice(1)} quality shoppers notice on the main image and PDP`,
    "Clear benefit-led copy — no keyword stuffing, built for Amazon and Bol.com",
    "Accent color used sparingly on badges, callouts, and EU compliance graphics",
  ];
  return bullets[index] ?? bullets[0];
}

export function BrandListingPreview({
  profile,
  complete,
  checklist,
}: {
  profile: PreviewProfile;
  complete: boolean;
  checklist: { label: string; done: boolean }[];
}) {
  const name = profile.displayName?.trim() || "Your brand";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
          Amazon / Bol.com preview
        </p>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-medium",
            complete
              ? "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
              : "border border-[var(--border)] bg-[var(--muted)]/50 text-[var(--muted-fg)]"
          )}
        >
          {complete ? "Ready for studios" : "Finish essentials below"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div
          className="aspect-square p-6"
          style={{
            background: `linear-gradient(145deg, ${profile.primaryColor}14, ${profile.secondaryColor}20)`,
          }}
        >
          {profile.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logoUrl}
              alt={`${name} logo`}
              className="mx-auto h-16 max-w-[180px] object-contain"
            />
          ) : (
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-[var(--shadow-sm)]"
              style={{ backgroundColor: profile.primaryColor }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="mt-4 text-center text-xs text-[var(--muted-fg)]">Main image · lifestyle · infographic modules</p>
        </div>
        <div className="space-y-3 border-t border-[var(--border)] p-4">
          <h3 className="font-serif text-lg leading-snug text-[var(--foreground)]">
            {name} — Example product title for {profile.language?.toUpperCase() || "EN"} listings
          </h3>
          {profile.tagline ? (
            <p className="text-sm text-[var(--muted-fg)]">{profile.tagline}</p>
          ) : null}
          <ul className="space-y-1.5 text-xs text-[var(--muted-fg)]">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold" style={{ color: profile.primaryColor }}>
                  •
                </span>
                <span>{sampleBullet(profile.tone, i)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <span
              className="inline-flex rounded-md px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: profile.primaryColor }}
            >
              Add to cart
            </span>
            <span
              className="inline-flex rounded-md border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: profile.secondaryColor, color: profile.secondaryColor }}
            >
              Ships from EU warehouse
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Used on your next run</p>
        <ul className="mt-3 space-y-2">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-start gap-2 text-sm">
              {item.done ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-fg)]" />
              )}
              <span className={item.done ? "text-[var(--foreground)]" : "text-[var(--muted-fg)]"}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
