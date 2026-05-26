"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { fetchJson } from "@/lib/fetch-json";
import type { BrandProfileData } from "@/lib/brand-profile";
import { UnsavedNavigationGuard } from "@/hooks/use-unsaved-navigation-guard";
import { cn } from "@/lib/utils";

export function BrandProfileForm() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<BrandProfileData>({
    displayName: "",
    primaryColor: "#B45309",
    secondaryColor: "#0D5C63",
    tone: "",
    logoUrl: "",
    guidelines: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [baseline, setBaseline] = useState<BrandProfileData | null>(null);

  useEffect(() => {
    fetchJson<{ profile: BrandProfileData }>("/api/brand-profile")
      .then(({ data }) => {
        const loaded = {
          displayName: data.profile.displayName ?? "",
          primaryColor: data.profile.primaryColor,
          secondaryColor: data.profile.secondaryColor,
          tone: data.profile.tone,
          logoUrl: data.profile.logoUrl ?? "",
          guidelines: data.profile.guidelines ?? "",
        };
        setProfile(loaded);
        setBaseline(loaded);
      })
      .catch(() => {
        setLoadError("Could not load your brand profile. Refresh the page or try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const isDirty = useMemo(() => {
    if (!baseline) return false;
    return JSON.stringify(profile) !== JSON.stringify(baseline);
  }, [profile, baseline]);

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
    const { ok, data } = await fetchJson<{ error?: string }>("/api/brand-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (ok) {
      setBaseline(profile);
      setSaved(true);
      toast("Brand profile saved");
      setTimeout(() => setSaved(false), 2500);
    } else {
      const msg = data.error || "Could not save brand profile. Try again.";
      setError(msg);
      toast(msg, "error");
    }
    setSaving(false);
  }, [profile, toast]);

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

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-11 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="min-h-[280px] w-full" />
      </div>
    );
  }

  return (
    <>
      <div className={cn("grid gap-8 lg:grid-cols-2", isDirty && "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0")}>
      <Card className="shadow-[var(--shadow-md)]">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-[var(--muted-fg)]">
            Set once — colors, tone, and logo flow into every PHOILA image and copy run.
          </p>
          {loadError ? (
            <p className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">
              {loadError}
            </p>
          ) : null}
          <div>
            <Label htmlFor="brand-name">Brand display name</Label>
            <Input
              id="brand-name"
              value={profile.displayName ?? ""}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand-primary">Primary color</Label>
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
              <Label htmlFor="brand-secondary">Secondary (EU accent)</Label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  aria-label="Secondary color picker"
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
            <Label htmlFor="brand-tone">Brand tone</Label>
            <Input
              id="brand-tone"
              value={profile.tone}
              onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
              placeholder="premium, trustworthy, no hype"
            />
          </div>
          <div>
            <Label htmlFor="brand-logo-url">Logo</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              <Input
                id="brand-logo-url"
                value={profile.logoUrl ?? ""}
                onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                placeholder="https://… or upload below"
                className="min-w-[200px] flex-1"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-sm hover:border-[var(--accent)]">
                {uploadingLogo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload logo
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingLogo}
                  onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                />
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="brand-guidelines">Extra guidelines</Label>
            <Textarea
              id="brand-guidelines"
              value={profile.guidelines ?? ""}
              onChange={(e) => setProfile({ ...profile, guidelines: e.target.value })}
              placeholder="Always show EU energy label, never show hands, etc."
            />
          </div>
          <Button
            onClick={save}
            className={cn("w-full", isDirty && "hidden md:inline-flex")}
            disabled={!isDirty || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : saved ? (
              "Saved ✓"
            ) : isDirty ? (
              "Save brand profile"
            ) : (
              "No changes to save"
            )}
          </Button>
          {saved ? (
            <Button asChild variant="outline" className="w-full">
              <Link href="/generate">Try image studio</Link>
            </Button>
          ) : null}
          {isDirty ? (
            <p className="text-xs text-[var(--muted-fg)]">
              Unsaved changes — save from the bar below on mobile, or use Save / ⌘/Ctrl+S on desktop.
            </p>
          ) : null}
          {error ? (
            <p className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden" style={{ borderColor: profile.primaryColor }}>
        <div
          className="h-3"
          style={{
            background: `linear-gradient(90deg, ${profile.primaryColor}, ${profile.secondaryColor})`,
          }}
        />
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
            Listing preview mockup
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
            <div className="aspect-square bg-[var(--muted)]/30 p-6">
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logoUrl}
                  alt={`${profile.displayName || "Brand"} logo`}
                  className="mx-auto h-12 max-w-[140px] object-contain"
                />
              ) : (
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
                  style={{ backgroundColor: profile.primaryColor }}
                >
                  {(profile.displayName || "B").charAt(0)}
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <h3 className="font-serif text-lg leading-snug" style={{ color: profile.primaryColor }}>
                {profile.displayName || "Your brand"} — Sample product title
              </h3>
              <p className="text-xs text-[var(--muted-fg)]">
                Tone: {profile.tone || "Set your brand voice"}
              </p>
              <div
                className="rounded-lg px-3 py-2 text-xs text-white"
                style={{ backgroundColor: profile.secondaryColor }}
              >
                Bol.com & Amazon-ready · RUFUS-optimized copy
              </div>
            </div>
          </div>
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
                <Save className="h-4 w-4" /> Save brand profile
              </>
            )}
          </Button>
        </div>
      ) : null}

      <UnsavedNavigationGuard
        enabled={isDirty}
        onSave={save}
        title="Unsaved brand profile"
        description="Save your brand colors and tone before leaving, or discard changes to continue."
      />
    </>
  );
}
