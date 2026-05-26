"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StudioStepper } from "@/components/ui/studio-stepper";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";
import { fetchJson } from "@/lib/fetch-json";
import type { BrandProfileData } from "@/lib/brand-profile";

const STEPS = ["Company", "Brand identity", "Brand story", "Launch"];

export function BrandOnboardingWizard({ initialProfile }: { initialProfile: BrandProfileData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
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
  });
  const [generatingStory, setGeneratingStory] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          body: JSON.stringify(profile),
        }
      );
      if (!ok || !data.brandStory) throw new Error(data.error || "Could not generate brand story");
      setProfile((p) => ({ ...p, brandStory: data.brandStory ?? "" }));
      toast("Brand story generated — edit before saving");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Brand story generation failed");
    } finally {
      setGeneratingStory(false);
    }
  };

  const saveProfile = useCallback(
    async (complete: boolean) => {
      setSaving(true);
      setError("");
      const { ok, data } = await fetchJson<{ error?: string }>("/api/brand-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          displayName: profile.displayName || null,
          companyName: profile.companyName || null,
          companyDescription: profile.companyDescription || null,
          targetAudience: profile.targetAudience || null,
          logoUrl: profile.logoUrl || null,
          guidelines: profile.guidelines || null,
          brandStory: profile.brandStory || null,
          onboardingComplete: complete,
        }),
      });
      setSaving(false);
      if (!ok) {
        const msg = data.error || "Could not save brand profile";
        setError(msg);
        toast(msg, "error");
        return false;
      }
      return true;
    },
    [profile, toast]
  );

  const finishOnboarding = async () => {
    if (!profile.brandStory.trim()) {
      setError("Generate or write a brand story before continuing.");
      return;
    }
    const ok = await saveProfile(true);
    if (ok) {
      toast("Brand setup complete");
      router.push("/generate");
      router.refresh();
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow="Setup"
        title="Set up your brand first"
        description="ProductPixl uses your company, brand story, and visual identity in every image prompt and listing copy run — so outputs stay on-brand."
      />

      <StudioStepper steps={STEPS} currentStep={step} label="Brand onboarding progress" sticky />

      {error ? (
        <p className="rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-6 md:p-8">
            <p className="text-sm text-[var(--muted-fg)]">
              Tell us about the business behind your listings. This context feeds AI prompts even when a product photo
              is ambiguous.
            </p>
            <div>
              <Label htmlFor="onboard-company">Company name</Label>
              <Input
                id="onboard-company"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                placeholder="Acme Brands BV"
              />
            </div>
            <div>
              <Label htmlFor="onboard-company-desc">What does your company sell?</Label>
              <Textarea
                id="onboard-company-desc"
                value={profile.companyDescription}
                onChange={(e) => setProfile({ ...profile, companyDescription: e.target.value })}
                placeholder="Premium home & personal care for EU marketplace sellers…"
              />
            </div>
            <div>
              <Label htmlFor="onboard-audience">Target audience</Label>
              <Input
                id="onboard-audience"
                value={profile.targetAudience}
                onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                placeholder="Health-conscious families, premium skincare buyers…"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!profile.companyName.trim() || !profile.companyDescription.trim()}
              >
                Continue to brand identity
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardContent className="space-y-4 p-6 md:p-8">
            <div>
              <Label htmlFor="onboard-brand-name">Brand display name</Label>
              <Input
                id="onboard-brand-name"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Zealots"
              />
            </div>
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
              <Label htmlFor="onboard-tone">Brand tone</Label>
              <Input
                id="onboard-tone"
                value={profile.tone}
                onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="onboard-logo">Logo</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                <Input
                  id="onboard-logo"
                  value={profile.logoUrl}
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
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)} disabled={!profile.displayName.trim() || !profile.tone.trim()}>
                Continue to brand story
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardContent className="space-y-4 p-6 md:p-8">
            <p className="text-sm text-[var(--muted-fg)]">
              We&apos;ll generate a brand story from your company and identity. Edit it — this paragraph is injected
              into every image and copy run.
            </p>
            <Button type="button" variant="outline" disabled={generatingStory} onClick={() => void generateStory()}>
              {generatingStory ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating story…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate brand story with AI
                </>
              )}
            </Button>
            <div>
              <Label htmlFor="onboard-story">Brand story</Label>
              <Textarea
                id="onboard-story"
                rows={8}
                value={profile.brandStory}
                onChange={(e) => setProfile({ ...profile, brandStory: e.target.value })}
                placeholder="Your brand story will appear here…"
              />
            </div>
            <div>
              <Label htmlFor="onboard-guidelines">Extra creative guidelines (optional)</Label>
              <Textarea
                id="onboard-guidelines"
                value={profile.guidelines}
                onChange={(e) => setProfile({ ...profile, guidelines: e.target.value })}
                placeholder="Never show hands, always include EU energy label, etc."
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!profile.brandStory.trim()}>
                Review & launch
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="border-[var(--accent)]/25 bg-[var(--accent-soft)]/20">
          <CardContent className="space-y-4 p-6 md:p-8">
            <h2 className="font-serif text-xl">Ready to add products</h2>
            <p className="text-sm text-[var(--muted-fg)]">
              Next, upload a product photo in Image studio. You&apos;ll confirm vibe, use case, reference images, and
              AI-extracted details before prompts are built — all enriched with your brand story.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Brand:</strong> {profile.displayName}
              </li>
              <li>
                <strong>Company:</strong> {profile.companyName}
              </li>
              <li>
                <strong>Audience:</strong> {profile.targetAudience}
              </li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button disabled={saving} onClick={() => void finishOnboarding()}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Finish setup & open image studio"
                )}
              </Button>
              <Button asChild variant="outline">
                <Link href="/brand">Edit brand profile later</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
