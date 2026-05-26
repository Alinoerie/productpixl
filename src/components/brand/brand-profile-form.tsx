"use client";

import Link from "next/link";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Save, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { fetchJson } from "@/lib/fetch-json";
import { DEFAULT_BRAND_PROFILE, type BrandProfileData } from "@/lib/brand-profile-types";
import {
  LISTING_LANGUAGES,
  TONE_PRESETS,
  VISUAL_STYLE_PRESETS,
  toneMatchesPreset,
  visualMatchesPreset,
} from "@/lib/brand-kit-presets";
import { BrandKitImpact } from "@/components/brand/brand-kit-impact";
import { BrandListingPreview } from "@/components/brand/brand-listing-preview";
import { UnsavedNavigationGuard } from "@/hooks/use-unsaved-navigation-guard";
import { cn } from "@/lib/utils";

type ExtendedBrandProfile = BrandProfileData & {
  language?: string;
  tagline?: string | null;
  brandValues?: string | null;
  brandAesthetic?: string | null;
  brandId?: string;
  brandName?: string;
};

function Section({
  title,
  description,
  children,
  defaultOpen = true,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--border)] pb-6 last:border-0 last:pb-0">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">{description}</p>
        </div>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open ? <div className="mt-4 space-y-4">{children}</div> : null}
    </div>
  );
}

export function BrandProfileForm() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ExtendedBrandProfile>(DEFAULT_BRAND_PROFILE);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [baseline, setBaseline] = useState<ExtendedBrandProfile | null>(null);

  useEffect(() => {
    fetchJson<{ profile: ExtendedBrandProfile }>("/api/brand-profile")
      .then(({ data }) => {
        const loaded: ExtendedBrandProfile = {
          companyName: data.profile.companyName,
          companyDescription: data.profile.companyDescription,
          targetAudience: data.profile.targetAudience,
          displayName: data.profile.displayName ?? data.profile.brandName ?? "",
          primaryColor: data.profile.primaryColor,
          secondaryColor: data.profile.secondaryColor,
          tone: data.profile.tone,
          logoUrl: data.profile.logoUrl,
          guidelines: data.profile.guidelines,
          brandStory: data.profile.brandStory,
          onboardingComplete: data.profile.onboardingComplete,
          language: data.profile.language ?? "en",
          tagline: data.profile.tagline ?? null,
          brandValues: data.profile.brandValues ?? null,
          brandAesthetic: data.profile.brandAesthetic ?? null,
          brandId: data.profile.brandId,
          brandName: data.profile.brandName,
        };
        setProfile(loaded);
        setBaseline(loaded);
      })
      .catch(() => {
        setLoadError("Could not load your brand kit. Refresh the page or try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const isDirty = useMemo(() => {
    if (!baseline) return false;
    return JSON.stringify(profile) !== JSON.stringify(baseline);
  }, [profile, baseline]);

  const kitReady = Boolean(
    profile.displayName?.trim() && profile.tone?.trim() && (profile.brandStory?.trim() || profile.tagline?.trim())
  );

  const checklist = useMemo(
    () => [
      { label: "Brand name on listings", done: Boolean(profile.displayName?.trim()) },
      { label: "Listing language", done: Boolean(profile.language?.trim()) },
      { label: "Copy tone", done: Boolean(profile.tone?.trim()) },
      { label: "Brand colors", done: Boolean(profile.primaryColor && profile.secondaryColor) },
      { label: "Logo (recommended)", done: Boolean(profile.logoUrl?.trim()) },
      { label: "About your brand or tagline", done: Boolean(profile.brandStory?.trim() || profile.tagline?.trim()) },
    ],
    [profile]
  );

  const generateStory = async () => {
    setGeneratingStory(true);
    setError("");
    try {
      const { ok, data } = await fetchJson<{ brandStory?: string; error?: string }>(
        "/api/brand-profile/generate-story",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: profile.displayName,
            companyDescription: profile.companyDescription,
            targetAudience: profile.targetAudience,
            displayName: profile.displayName,
            tone: profile.tone,
            guidelines: profile.guidelines,
          }),
        }
      );
      if (!ok || !data.brandStory) throw new Error(data.error || "Could not generate brand story");
      setProfile((p) => ({ ...p, brandStory: data.brandStory ?? null }));
      toast("Draft generated — edit it to match how you sell");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingStory(false);
    }
  };

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { ok, data } = await fetchJson<{ url?: string; error?: string }>("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!ok) throw new Error(data.error || "Upload failed");
      setProfile((p) => ({ ...p, logoUrl: data.url ?? "" }));
      toast("Logo uploaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const save = useCallback(async () => {
    setError("");
    setSaving(true);
    const displayName = profile.displayName?.trim() || "";
    const brandStory = profile.brandStory?.trim() || null;
    const payload = {
      ...profile,
      displayName,
      companyName: displayName || null,
      companyDescription: brandStory ? brandStory.slice(0, 280) : profile.companyDescription,
      brandStory,
      onboardingComplete: profile.onboardingComplete || kitReady,
    };
    const { ok, data } = await fetchJson<{ error?: string }>("/api/brand-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (ok) {
      setProfile(payload);
      setBaseline(payload);
      setSaved(true);
      toast("Brand kit saved — applies to your next run");
      setTimeout(() => setSaved(false), 2500);
    } else {
      const msg = data.error || "Could not save. Try again.";
      setError(msg);
      toast(msg, "error");
    }
    setSaving(false);
  }, [profile, kitReady, toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty && !saving) void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, saving, save]);

  const activeTonePreset = toneMatchesPreset(profile.tone);
  const activeVisualPreset = visualMatchesPreset(profile.brandAesthetic);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <BrandKitImpact />

      <div
        className={cn(
          "grid gap-8 lg:grid-cols-[1fr,min(340px,38%)]",
          isDirty && "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0"
        )}
      >
        <Card className="shadow-[var(--shadow-md)]">
          <CardContent className="space-y-6 p-6">
            {profile.brandName ? (
              <p className="text-sm text-[var(--muted-fg)]">
                Editing <strong className="text-[var(--foreground)]">{profile.brandName}</strong> — switch brands
                from the sidebar.{" "}
                <Link href={STUDIO_ROUTES.brandsList} className="text-[var(--accent)] underline-offset-2 hover:underline">
                  Manage all brands
                </Link>
              </p>
            ) : null}
            {loadError ? (
              <p className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">
                {loadError}
              </p>
            ) : null}

            <Section title="Listing identity" description="What shoppers see on Amazon, Bol.com, and Shopify PDPs.">
              <div>
                <Label htmlFor="brand-name">Brand name on listings</Label>
                <Input
                  id="brand-name"
                  value={profile.displayName ?? ""}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="e.g. Copper Horizon"
                />
              </div>
              <div>
                <Label htmlFor="brand-tagline">One-line promise (optional)</Label>
                <Input
                  id="brand-tagline"
                  value={profile.tagline ?? ""}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value || null })}
                  placeholder="Gentle care for sensitive skin — ships fast from the EU"
                />
              </div>
              <div>
                <Label htmlFor="brand-language">Listing language</Label>
                <select
                  id="brand-language"
                  value={profile.language ?? "en"}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="mt-1 flex h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                >
                  {LISTING_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="brand-logo-url">Logo</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Input
                    id="brand-logo-url"
                    value={profile.logoUrl ?? ""}
                    onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                    placeholder="Paste URL or upload"
                    className="min-w-[200px] flex-1"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-sm hover:border-[var(--accent)]">
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingLogo}
                      onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-fg)]">Used when packaging or lifestyle shots show your mark.</p>
              </div>
            </Section>

            <Section title="Visual system" description="Colors and style for image studio modules.">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand-primary">Primary color</Label>
                  <p className="text-xs text-[var(--muted-fg)]">Hero accents, CTAs, main callouts</p>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      aria-label="Primary color picker"
                      value={profile.primaryColor}
                      onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                      className="h-10 w-12 cursor-pointer rounded border"
                    />
                    <Input
                      id="brand-primary"
                      value={profile.primaryColor}
                      onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="brand-secondary">Accent color</Label>
                  <p className="text-xs text-[var(--muted-fg)]">Badges, secondary graphics, EU labels</p>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="color"
                      aria-label="Accent color picker"
                      value={profile.secondaryColor}
                      onChange={(e) => setProfile({ ...profile, secondaryColor: e.target.value })}
                      className="h-10 w-12 cursor-pointer rounded border"
                    />
                    <Input
                      id="brand-secondary"
                      value={profile.secondaryColor}
                      onChange={(e) => setProfile({ ...profile, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Visual style preset</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VISUAL_STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, brandAesthetic: preset.value })}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        activeVisualPreset === preset.id
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] hover:border-[var(--accent)]/40"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Copy voice" description="How titles and bullets should sound on marketplaces.">
              <div>
                <Label htmlFor="brand-audience">Who buys from you</Label>
                <Input
                  id="brand-audience"
                  value={profile.targetAudience ?? ""}
                  onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value || null })}
                  placeholder="Sensitive-skin households shopping Amazon DE & Bol.com"
                />
              </div>
              <div>
                <Label>Tone preset</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TONE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, tone: preset.value })}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        activeTonePreset === preset.id
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] hover:border-[var(--accent)]/40"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <Input
                  id="brand-tone"
                  className="mt-3"
                  value={profile.tone}
                  onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
                  placeholder="Or write your own tone keywords"
                />
              </div>
              <div>
                <Label htmlFor="brand-story">About your brand</Label>
                <Textarea
                  id="brand-story"
                  value={profile.brandStory ?? ""}
                  onChange={(e) => setProfile({ ...profile, brandStory: e.target.value || null })}
                  placeholder="2–4 sentences: what you sell, who it's for, and how listings should feel."
                  rows={4}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={generatingStory || !profile.displayName?.trim()}
                  onClick={() => void generateStory()}
                >
                  {generatingStory ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Drafting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Draft with AI
                    </>
                  )}
                </Button>
              </div>
            </Section>

            <Section
              title="Generation rules"
              description="Hard constraints for every image and copy run."
              defaultOpen={Boolean(profile.guidelines?.trim())}
            >
              <Textarea
                id="brand-guidelines"
                value={profile.guidelines ?? ""}
                onChange={(e) => setProfile({ ...profile, guidelines: e.target.value })}
                placeholder="Always include EU energy label on infographics. Never show hands. No medical claims."
                rows={3}
              />
            </Section>

            {isDirty ? (
              <Button onClick={save} className="hidden w-full md:inline-flex" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save brand kit
                  </>
                )}
              </Button>
            ) : saved ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={STUDIO_ROUTES.images}>Image studio</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={STUDIO_ROUTES.copy}>Copy studio</Link>
                </Button>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted-fg)]">Changes apply to the next generation — saved projects keep their assets.</p>
            )}

            {error ? (
              <p className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="h-fit overflow-hidden lg:sticky lg:top-6" style={{ borderColor: profile.primaryColor }}>
          <div
            className="h-2"
            style={{
              background: `linear-gradient(90deg, ${profile.primaryColor}, ${profile.secondaryColor})`,
            }}
          />
          <CardContent className="p-6">
            <BrandListingPreview profile={profile} complete={kitReady} checklist={checklist} />
          </CardContent>
        </Card>
      </div>

      {isDirty ? (
        <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-md md:hidden">
          <Button className="w-full" disabled={saving} onClick={save}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save brand kit
              </>
            )}
          </Button>
        </div>
      ) : null}

      <UnsavedNavigationGuard
        enabled={isDirty}
        onSave={save}
        title="Unsaved brand kit"
        description="Save your listing brand kit before leaving, or discard changes."
      />
    </>
  );
}
