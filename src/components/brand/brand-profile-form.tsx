"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { fetchJson } from "@/lib/fetch-json";
import type { BrandProfileData } from "@/lib/brand-profile";

export function BrandProfileForm() {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<{ profile: BrandProfileData }>("/api/brand-profile")
      .then(({ data }) => {
        setProfile({
          displayName: data.profile.displayName ?? "",
          primaryColor: data.profile.primaryColor,
          secondaryColor: data.profile.secondaryColor,
          tone: data.profile.tone,
          logoUrl: data.profile.logoUrl ?? "",
          guidelines: data.profile.guidelines ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setError("");
    const { ok, data } = await fetchJson<{ error?: string }>("/api/brand-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(data.error || "Could not save brand profile. Try again.");
    }
  };

  if (loading) return <p className="text-[var(--muted-fg)]">Loading brand profile…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="shadow-[var(--shadow-md)]">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-[var(--muted-fg)]">
            Like Pixii&apos;s Brand Profile — set once, applied to every image and copy run.
          </p>
          <div>
            <Label>Brand display name</Label>
            <Input
              value={profile.displayName ?? ""}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary color</Label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={profile.primaryColor}
                  onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                  className="h-10 w-12 cursor-pointer rounded border"
                />
                <Input
                  value={profile.primaryColor}
                  onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Secondary (EU accent)</Label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={profile.secondaryColor}
                  onChange={(e) => setProfile({ ...profile, secondaryColor: e.target.value })}
                  className="h-10 w-12 cursor-pointer rounded border"
                />
                <Input
                  value={profile.secondaryColor}
                  onChange={(e) => setProfile({ ...profile, secondaryColor: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div>
            <Label>Brand tone</Label>
            <Input
              value={profile.tone}
              onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
              placeholder="premium, trustworthy, no hype"
            />
          </div>
          <div>
            <Label>Logo URL (optional)</Label>
            <Input
              value={profile.logoUrl ?? ""}
              onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
              placeholder="https://…"
            />
            {profile.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logoUrl}
                alt="Brand logo preview"
                className="mt-3 h-14 max-w-[200px] rounded-lg border border-[var(--border)] bg-white object-contain p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
          </div>
          <div>
            <Label>Extra guidelines</Label>
            <Textarea
              value={profile.guidelines ?? ""}
              onChange={(e) => setProfile({ ...profile, guidelines: e.target.value })}
              placeholder="Always show EU energy label, never show hands, etc."
            />
          </div>
          <Button onClick={save} className="w-full">
            {saved ? "Saved ✓" : "Save brand profile"}
          </Button>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card
        className="overflow-hidden"
        style={{
          borderColor: profile.primaryColor,
        }}
      >
        <div
          className="h-3"
          style={{
            background: `linear-gradient(90deg, ${profile.primaryColor}, ${profile.secondaryColor})`,
          }}
        />
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
            Preview
          </p>
          {profile.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logoUrl}
              alt=""
              className="mt-3 h-10 max-w-[160px] object-contain"
            />
          ) : null}
          <h3 className="mt-2 font-serif text-2xl" style={{ color: profile.primaryColor }}>
            {profile.displayName || "Your brand"}
          </h3>
          <p className="mt-2 text-sm text-[var(--muted-fg)]">Tone: {profile.tone}</p>
          <div
            className="mt-6 rounded-xl p-4 text-sm text-white"
            style={{ backgroundColor: profile.secondaryColor }}
          >
            Bol.com & Amazon-ready · RUFUS-optimized copy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
