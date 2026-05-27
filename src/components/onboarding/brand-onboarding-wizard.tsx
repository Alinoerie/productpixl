"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StudioStepper } from "@/components/ui/studio-stepper";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchJson } from "@/lib/fetch-json";
import type { BrandProfileData } from "@/lib/brand-profile";
import {
  LISTING_LANGUAGES,
  TONE_PRESETS,
  VISUAL_STYLE_PRESETS,
  toneMatchesPreset,
  visualMatchesPreset,
} from "@/lib/brand-kit-presets";
import { cn } from "@/lib/utils";

const STEPS = ["Listing identity", "Visual system", "Copy voice", "Launch"];

type OnboardProfile = BrandProfileData & {
  language?: string;
  tagline?: string | null;
  brandAesthetic?: string | null;
};

export function BrandOnboardingWizard({ initialProfile }: { initialProfile: BrandProfileData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardProfile>({
    companyName: initialProfile.companyName ?? "",
    companyDescription: initialProfile.companyDescription ?? "",
    targetAudience: initialProfile.targetAudience ?? "",
    displayName: initialProfile.displayName ?? "",
    primaryColor: initialProfile.primaryColor,
    secondaryColor: initialProfile.secondaryColor,
    tone: initialProfile.tone,
    logoUrl: initialProfile.logoUrl ?? "",
    guidelines: initialProfile.guidelines ?? "",
    brandStory: initialProfile.brandStory ?? "",
    onboardingComplete: initialProfile.onboardingComplete ?? false,
    language: "en",
    tagline: null,
    brandAesthetic: null,
  });
  const [generatingStory, setGeneratingStory] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isDirty = useMemo(() => {
    return (
      profile.displayName !== (initialProfile.displayName ?? "") ||
      profile.tagline !== (initialProfile.tagline ?? null) ||
      profile.language !== "en" ||
      profile.logoUrl !== (initialProfile.logoUrl ?? "") ||
      profile.primaryColor !== initialProfile.primaryColor ||
      profile.secondaryColor !== initialProfile.secondaryColor ||
      profile.brandAesthetic !== (initialProfile.brandAesthetic ?? null) ||
      profile.targetAudience !== (initialProfile.targetAudience ?? "") ||
      profile.tone !== (initialProfile.tone ?? "") ||
      profile.brandStory !== (initialProfile.brandStory ?? "") ||
      profile.guidelines !== (initialProfile.guidelines ?? "")
    );
  }, [profile, initialProfile]);

  const handleBack = useCallback(
    (targetStep: number) => {
      if (isDirty) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to go back?"
        );
        if (!confirmed) return;
      }
      setStep(targetStep);
    },
    [isDirty]
  );

  const kitReady = Boolean(
    profile.displayName?.trim() && profile.tone?.trim() && (profile.brandStory?.trim() || profile.tagline?.trim())
  );

  const activeTonePreset = toneMatchesPreset(profile.tone);
  const activeVisualPreset = visualMatchesPreset(profile.brandAesthetic);

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
      setProfile((p) => ({ ...p, brandStory: data.brandStory ?? "" }));
      toast("Draft generated — edit it to match how you sell");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingStory(false);
    }
  };

  const saveProfile = useCallback(
    async (complete: boolean) => {
      setSaving(true);
      setError("");
      const displayName = profile.displayName?.trim() || "";
      const brandStory = profile.brandStory?.trim() || null;
      const { ok, data } = await fetchJson<{ error?: string }>("/api/brand-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          displayName,
          companyName: displayName || null,
          companyDescription: brandStory ? brandStory.slice(0, 280) : profile.companyDescription || null,
          targetAudience: profile.targetAudience || null,
          logoUrl: profile.logoUrl || null,
          guidelines: profile.guidelines || null,
          brandStory,
          tagline: profile.tagline?.trim() || null,
          brandAesthetic: profile.brandAesthetic?.trim() || null,
          language: profile.language ?? "en",
          onboardingComplete: complete ? kitReady : false,
        }),
      });
      setSaving(false);
      if (!ok) {
        const msg = data.error || "Could not save brand kit";
        setError(msg);
        toast(msg, "error");
        return false;
      }
      return true;
    },
    [profile, kitReady, toast]
  );

  const continueStep = async (nextStep: number) => {
    const ok = await saveProfile(false);
    if (ok) setStep(nextStep);
  };

  const finishOnboarding = async () => {
    if (!kitReady) {
      setError("Add a brand name, copy tone, and either a tagline or about-your-brand paragraph.");
      return;
    }
    const ok = await saveProfile(true);
    if (ok) {
      toast("Brand kit ready — open Content studio");
      router.push(`${STUDIO_ROUTES.home}?firstRun=1`);
      router.refresh();
    }
  };

  return (
    <div id="brand-form" className="scroll-mt-24 space-y-8 pb-8">
      <PageHeader
        eyebrow="Setup"
        title="Set up your listing brand kit"
        description="Name, colors, voice, and visual style feed every image prompt and listing copy run — so outputs stay on-brand across marketplaces."
      />

      <StudioStepper steps={STEPS} currentStep={step} label="Brand kit onboarding" sticky />

      {error ? (
        <p className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-6 md:p-8">
            <p className="text-sm text-[var(--muted-fg)]">
              What shoppers see on Amazon, Bol.com, and Shopify — this is the name and language on every listing.
            </p>
            <div>
              <Label htmlFor="onboard-brand-name">Brand name on listings</Label>
              <Input
                id="onboard-brand-name"
                value={profile.displayName ?? ""}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Copper Horizon"
              />
            </div>
            <div>
              <Label htmlFor="onboard-tagline">One-line promise (optional)</Label>
              <Input
                id="onboard-tagline"
                value={profile.tagline ?? ""}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value || null })}
                placeholder="Gentle care for sensitive skin — ships fast from the EU"
              />
            </div>
            <div>
              <Label htmlFor="onboard-language">Listing language</Label>
              <Select
                value={profile.language ?? "en"}
                onValueChange={(value) => setProfile({ ...profile, language: value })}
              >
                <SelectTrigger id="onboard-language" className="mt-1 w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="onboard-logo">Logo (recommended)</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                <Input
                  id="onboard-logo"
                  value={profile.logoUrl ?? ""}
                  onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                  placeholder="https://… or upload"
                  className="min-w-[200px] flex-1"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-sm">
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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
            <div className="flex justify-end">
              <Button
                disabled={!profile.displayName?.trim() || saving}
                onClick={() => void continueStep(1)}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Continue to visual system"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardContent className="space-y-4 p-6 md:p-8">
            <p className="text-sm text-[var(--muted-fg)]">
              Colors and visual style guide AI image generation — pick a preset or describe your own look.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="onboard-primary">Primary color</Label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    aria-label="Primary color picker"
                    value={profile.primaryColor}
                    onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                    className="h-10 w-12 cursor-pointer rounded border"
                  />
                  <Input
                    id="onboard-primary"
                    value={profile.primaryColor}
                    onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="onboard-secondary">Secondary color</Label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    aria-label="Secondary color picker"
                    value={profile.secondaryColor}
                    onChange={(e) => setProfile({ ...profile, secondaryColor: e.target.value })}
                    className="h-10 w-12 cursor-pointer rounded border"
                  />
                  <Input
                    id="onboard-secondary"
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
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      activeVisualPreset === preset.id
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="onboard-aesthetic">Custom visual direction (optional)</Label>
              <Textarea
                id="onboard-aesthetic"
                value={profile.brandAesthetic ?? ""}
                onChange={(e) => setProfile({ ...profile, brandAesthetic: e.target.value || null })}
                placeholder="Muted earth tones, soft shadows, no busy backgrounds…"
                rows={3}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void handleBack(0)}>
                Back
              </Button>
              <Button disabled={saving} onClick={() => void continueStep(2)}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Continue to copy voice"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardContent className="space-y-4 p-6 md:p-8">
            <p className="text-sm text-[var(--muted-fg)]">
              Who you sell to and how listings should sound — injected into every title, bullet, and image prompt.
            </p>
            <div>
              <Label htmlFor="onboard-audience">Target shopper</Label>
              <Input
                id="onboard-audience"
                value={profile.targetAudience ?? ""}
                onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                placeholder="Health-conscious families, premium skincare buyers…"
              />
            </div>
            <div>
              <Label>Copy tone preset</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {TONE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, tone: preset.value })}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      activeTonePreset === preset.id
                        ? "bg-[var(--teal)] text-white"
                        : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="onboard-tone">Custom tone (optional)</Label>
              <Input
                id="onboard-tone"
                value={profile.tone}
                onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
                placeholder="Warm, reassuring, no hype — EU compliance aware"
              />
            </div>
            <Button type="button" variant="outline" disabled={generatingStory} onClick={() => void generateStory()}>
              {generatingStory ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Drafting…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Draft “about your brand” with AI
                </>
              )}
            </Button>
            <div>
              <Label htmlFor="onboard-story">About your brand</Label>
              <Textarea
                id="onboard-story"
                rows={6}
                value={profile.brandStory ?? ""}
                onChange={(e) => setProfile({ ...profile, brandStory: e.target.value })}
                placeholder="2–3 sentences on what you sell and why shoppers trust you…"
              />
              <p className="mt-1 text-xs text-[var(--muted-fg)]">
                Or keep your one-line promise from step 1 — either is enough to finish.
              </p>
            </div>
            <div>
              <Label htmlFor="onboard-guidelines">Generation rules (optional)</Label>
              <Textarea
                id="onboard-guidelines"
                value={profile.guidelines ?? ""}
                onChange={(e) => setProfile({ ...profile, guidelines: e.target.value })}
                placeholder="Never show hands, always include EU energy label, etc."
                rows={3}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void handleBack(1)}>
                Back
              </Button>
              <Button
                disabled={saving || !profile.tone.trim() || !(profile.brandStory?.trim() || profile.tagline?.trim())}
                onClick={() => void continueStep(3)}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Review & launch"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="border-[var(--accent)]/25 bg-[var(--accent-soft)]/20">
          <CardContent className="space-y-4 p-6 md:p-8">
            <h2 className="font-serif text-xl">Ready for your first listing run</h2>
            <p className="text-sm text-[var(--muted-fg)]">
              Open Content studio to generate gallery images or listing copy — your brand kit applies automatically.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Brand:</strong> {profile.displayName}
              </li>
              <li>
                <strong>Language:</strong>{" "}
                {LISTING_LANGUAGES.find((l) => l.value === profile.language)?.label ?? "English"}
              </li>
              <li>
                <strong>Voice:</strong> {profile.tagline?.trim() || profile.brandStory?.slice(0, 120) || "—"}
              </li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => void handleBack(2)}>
                Back
              </Button>
              <Button disabled={saving || !kitReady} onClick={() => void finishOnboarding()}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Finish setup & open Content studio"
                )}
              </Button>
              <Button asChild variant="outline">
                <Link href={STUDIO_ROUTES.brandProfile}>Edit brand kit later</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
