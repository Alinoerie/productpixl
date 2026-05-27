"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, Loader2, Sparkles, X } from "lucide-react";
import { BrandKitImpact } from "@/components/brand/brand-kit-impact";
import { BrandSwitcherPill } from "@/components/brand/brand-kit/brand-switcher-pill";
import { ColorPickerSplit } from "@/components/brand/brand-kit/color-picker-split";
import {
  DividerLabel,
  FieldLabel,
  SaveChip,
  SectionReveal,
} from "@/components/brand/brand-kit/brand-kit-primitives";
import { LanguageFlag } from "@/components/brand/brand-kit/language-flags";
import { PresetCardGrid, VisualStyleThumb } from "@/components/brand/brand-kit/preset-card-grid";
import { BrandKitPreviewPanel } from "@/components/brand/brand-kit/preview-panel";
import { RulesBuilder } from "@/components/brand/brand-kit/rules-builder";
import {
  BrandKitMobileTabs,
  BrandKitSectionNav,
  type BrandSectionId,
  type SectionNavItem,
} from "@/components/brand/brand-kit/section-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";
import type { BrandSummary } from "@/lib/brands";
import { DEFAULT_BRAND_PROFILE, type BrandProfileData } from "@/lib/brand-profile-types";
import {
  LISTING_LANGUAGES,
  TONE_PRESETS,
  VISUAL_STYLE_PRESETS,
  toneMatchesPreset,
  visualMatchesPreset,
} from "@/lib/brand-kit-presets";
import {
  defaultRulesForProfile,
  parseGuidelinesToRules,
  serializeRulesToGuidelines,
  type BrandRule,
} from "@/lib/brand-kit-rules";
import { fetchJson } from "@/lib/fetch-json";
import { cn } from "@/lib/utils";

type ExtendedBrandProfile = BrandProfileData & {
  language?: string;
  tagline?: string | null;
  brandValues?: string | null;
  brandAesthetic?: string | null;
  brandId?: string;
  brandName?: string;
};

function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function taglineSuggestions(name: string, toneId: string | null): string[] {
  const preset = TONE_PRESETS.find((p) => p.id === toneId) ?? TONE_PRESETS[0];
  const base = name.trim() || "Your brand";
  return [
    `${base} — ${preset.example}`,
    preset.example,
    `Shop ${base} on Amazon & Bol.com with confidence.`,
  ];
}

async function streamTextInto(
  text: string,
  onUpdate: (partial: string) => void,
  signal?: AbortSignal
) {
  let acc = "";
  for (const char of text) {
    if (signal?.aborted) break;
    acc += char;
    onUpdate(acc);
    await new Promise((r) => setTimeout(r, 12));
  }
}

export function BrandKitStudio({
  onHeaderActions,
}: {
  onHeaderActions?: (node: React.ReactNode) => void;
}) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ExtendedBrandProfile>(DEFAULT_BRAND_PROFILE);
  const [rules, setRules] = useState<BrandRule[]>([]);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<BrandSectionId>("identity");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savedSections, setSavedSections] = useState<Set<BrandSectionId>>(new Set());
  const [dirtySections, setDirtySections] = useState<Set<BrandSectionId>>(new Set());
  const [savingSection, setSavingSection] = useState<BrandSectionId | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [generatingTaglines, setGeneratingTaglines] = useState(false);
  const [taglineMenuOpen, setTaglineMenuOpen] = useState(false);
  const [taglineSuggestionsList, setTaglineSuggestionsList] = useState<string[]>([]);
  const [langMoreOpen, setLangMoreOpen] = useState(false);
  const [dragOverLogo, setDragOverLogo] = useState(false);
  const streamAbort = useRef<AbortController | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const brandColors = useMemo(
    () => ({
      primary: profile.primaryColor,
      secondary: profile.secondaryColor,
    }),
    [profile.primaryColor, profile.secondaryColor]
  );

  const previewProfile = useDebounced(profile, 280);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [profileRes, brandsRes] = await Promise.all([
        fetchJson<{ profile: ExtendedBrandProfile }>("/api/brand-profile"),
        fetchJson<{ brands: BrandSummary[] }>("/api/brands"),
      ]);
      const loaded: ExtendedBrandProfile = {
        companyName: profileRes.data.profile.companyName,
        companyDescription: profileRes.data.profile.companyDescription,
        targetAudience: profileRes.data.profile.targetAudience,
        displayName: profileRes.data.profile.displayName ?? profileRes.data.profile.brandName ?? "",
        primaryColor: profileRes.data.profile.primaryColor,
        secondaryColor: profileRes.data.profile.secondaryColor,
        tone: profileRes.data.profile.tone,
        logoUrl: profileRes.data.profile.logoUrl,
        guidelines: profileRes.data.profile.guidelines,
        brandStory: profileRes.data.profile.brandStory,
        onboardingComplete: profileRes.data.profile.onboardingComplete,
        language: profileRes.data.profile.language ?? "en",
        tagline: profileRes.data.profile.tagline ?? null,
        brandValues: profileRes.data.profile.brandValues ?? null,
        brandAesthetic: profileRes.data.profile.brandAesthetic ?? null,
        brandId: profileRes.data.profile.brandId,
        brandName: profileRes.data.profile.brandName,
      };
      setProfile(loaded);
      setBrands(brandsRes.data.brands ?? []);
      const parsed = parseGuidelinesToRules(loaded.guidelines);
      const initialRules =
        parsed.length > 0
          ? parsed
          : defaultRulesForProfile({
              displayName: loaded.displayName,
              language: loaded.language,
              tone: loaded.tone,
              primaryColor: loaded.primaryColor,
            });
      setRules(initialRules);
    } catch {
      setLoadError("Could not load your brand kit. Refresh the page or try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!onHeaderActions || !profile.brandId) return;
    onHeaderActions(
      <BrandSwitcherPill
        brands={brands}
        activeBrandId={profile.brandId}
        activeBrandName={profile.brandName ?? profile.displayName ?? "Brand"}
        primaryColor={profile.primaryColor}
      />
    );
  }, [onHeaderActions, brands, profile.brandId, profile.brandName, profile.displayName, profile.primaryColor]);

  useEffect(() => {
    const sections = mainRef.current?.querySelectorAll("[data-brand-section]");
    if (!sections?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0.1 }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

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

  const sectionIncomplete = useMemo(
    () => ({
      identity: !profile.displayName?.trim() || !profile.language?.trim(),
      visual: !profile.primaryColor || !profile.secondaryColor,
      copy: !profile.tone?.trim() || (!profile.brandStory?.trim() && !profile.tagline?.trim()),
      rules: false,
      preview: false,
    }),
    [profile]
  );

  const navItems: SectionNavItem[] = useMemo(
    () => [
      {
        id: "identity",
        label: "Identity",
        incomplete: sectionIncomplete.identity,
        unsaved: dirtySections.has("identity"),
      },
      {
        id: "visual",
        label: "Visual System",
        incomplete: sectionIncomplete.visual,
        unsaved: dirtySections.has("visual"),
      },
      {
        id: "copy",
        label: "Copy Voice",
        incomplete: sectionIncomplete.copy,
        unsaved: dirtySections.has("copy"),
      },
      {
        id: "rules",
        label: "Rules",
        badge: String(rules.filter((r) => r.text.trim()).length),
        unsaved: dirtySections.has("rules"),
      },
      { id: "preview", label: "Preview", unsaved: false },
    ],
    [dirtySections, rules, sectionIncomplete]
  );

  const markDirty = (section: BrandSectionId) => {
    setDirtySections((prev) => new Set(prev).add(section));
  };

  const flashSaved = (section: BrandSectionId) => {
    setSavedSections((prev) => new Set(prev).add(section));
    setDirtySections((prev) => {
      const next = new Set(prev);
      next.delete(section);
      return next;
    });
    setTimeout(() => {
      setSavedSections((prev) => {
        const next = new Set(prev);
        next.delete(section);
        return next;
      });
    }, 2000);
  };

  const saveSection = useCallback(
    async (section: BrandSectionId) => {
      if (savingSection) return;
      setSavingSection(section);
      setError("");
      const guidelines = serializeRulesToGuidelines(rules);
      const displayName = profile.displayName?.trim() || "";
      const brandStory = profile.brandStory?.trim() || null;
      const payload = {
        ...profile,
        displayName,
        companyName: displayName || null,
        companyDescription: brandStory ? brandStory.slice(0, 280) : profile.companyDescription,
        brandStory,
        guidelines,
        onboardingComplete: profile.onboardingComplete || kitReady,
      };
      const { ok, data } = await fetchJson<{ error?: string }>("/api/brand-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (ok) {
        setProfile(payload);
        flashSaved(section);
      } else {
        const msg = data.error || "Could not save. Try again.";
        setError(msg);
        toast(msg, "error");
      }
      setSavingSection(null);
    },
    [profile, rules, kitReady, savingSection, toast]
  );

  const handleSectionBlur = (section: BrandSectionId) => {
    if (!dirtySections.has(section)) return;
    void saveSection(section);
  };

  useEffect(() => {
    if (!dirtySections.has("rules")) return;
    const t = setTimeout(() => {
      void saveSection("rules");
    }, 900);
    return () => clearTimeout(t);
  }, [rules, dirtySections, saveSection]);

  const updateProfile = (patch: Partial<ExtendedBrandProfile>, section: BrandSectionId) => {
    setProfile((p) => ({ ...p, ...patch }));
    markDirty(section);
  };

  const updateRules = (next: BrandRule[]) => {
    setRules(next);
    markDirty("rules");
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
      updateProfile({ logoUrl: data.url ?? "" }, "identity");
      void saveSection("identity");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const generateTaglines = async () => {
    setGeneratingTaglines(true);
    setTaglineMenuOpen(true);
    const toneId = toneMatchesPreset(profile.tone);
    setTaglineSuggestionsList(taglineSuggestions(profile.displayName ?? "", toneId));
    setGeneratingTaglines(false);
  };

  const generateStory = async () => {
    setGeneratingStory(true);
    setError("");
    streamAbort.current?.abort();
    streamAbort.current = new AbortController();
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
            guidelines: serializeRulesToGuidelines(rules),
          }),
        }
      );
      if (!ok || !data.brandStory) throw new Error(data.error || "Could not generate brand story");
      markDirty("copy");
      setProfile((p) => ({ ...p, brandStory: "" }));
      await streamTextInto(
        data.brandStory,
        (partial) => setProfile((p) => ({ ...p, brandStory: partial })),
        streamAbort.current.signal
      );
      void saveSection("copy");
      toast("Brand story generated — tweak it to match how you sell");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingStory(false);
    }
  };

  const scrollToSection = (id: BrandSectionId) => {
    setActiveSection(id);
    if (id === "preview") {
      setPreviewOpen(true);
      return;
    }
    document.getElementById(`brand-section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeTonePreset = toneMatchesPreset(profile.tone);
  const activeVisualPreset = visualMatchesPreset(profile.brandAesthetic);
  const visibleLangs = LISTING_LANGUAGES.slice(0, 4);
  const overflowLangs = LISTING_LANGUAGES.slice(4);
  const displayNameLen = profile.displayName?.length ?? 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="ml-auto h-10 w-48" />
        <Skeleton className="h-[640px] w-full" />
      </div>
    );
  }

  return (
    <div
      ref={mainRef}
      className="space-y-6"
      style={{
        ["--brand-primary" as string]: brandColors.primary,
        ["--brand-secondary" as string]: brandColors.secondary,
      }}
    >
      <div className="flex flex-wrap items-center justify-end gap-3 xl:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </div>

      <BrandKitImpact />

      {loadError ? (
        <p className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">
          {loadError}
        </p>
      ) : null}

      <BrandKitMobileTabs items={navItems} activeId={activeSection} onSelect={scrollToSection} />

      <div
        className={cn(
          "grid gap-8",
          "lg:grid-cols-[var(--nav-w)_minmax(0,1fr)] xl:grid-cols-[var(--nav-w)_minmax(0,1fr)_320px]"
        )}
        style={{ ["--nav-w" as string]: navCollapsed ? "56px" : "220px" }}
      >
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <button
              type="button"
              onClick={() => setNavCollapsed((v) => !v)}
              className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            >
              {navCollapsed ? "»" : "« Collapse"}
            </button>
            {!navCollapsed ? (
              <BrandKitSectionNav items={navItems} activeId={activeSection} onSelect={scrollToSection} />
            ) : (
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "relative flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold",
                      item.id === activeSection ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted-fg)]"
                    )}
                  >
                    {item.label.charAt(0)}
                    {item.unsaved ? (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-10" onBlur={(e) => {
          const section = (e.target as HTMLElement).closest("[data-brand-section]")?.getAttribute("data-brand-section") as BrandSectionId | null;
          if (section && section !== "preview") handleSectionBlur(section);
        }}>
          <SectionReveal id="brand-section-identity" sectionId="identity" className="space-y-6">
            <div className="flex items-center gap-3">
              <DividerLabel>Identity</DividerLabel>
              <SaveChip visible={savedSections.has("identity")} />
              {savingSection === "identity" ? <Loader2 className="h-3 w-3 animate-spin text-[var(--muted-fg)]" /> : null}
            </div>

            <FieldLabel hint="Shown on Amazon, Bol.com, and Shopify PDPs">Brand name</FieldLabel>
            <input
              value={profile.displayName ?? ""}
              onChange={(e) => updateProfile({ displayName: e.target.value }, "identity")}
              placeholder="e.g. Copper Horizon"
              className="w-full border-0 border-b border-[var(--border)] bg-transparent py-2 text-2xl font-semibold outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--muted-fg)]/50 focus:border-[var(--brand-primary)] focus:shadow-[0_1px_0_0_var(--brand-primary)]"
              maxLength={80}
            />
            <div className="flex items-center justify-between text-xs text-[var(--muted-fg)]">
              <span>{displayNameLen}/80</span>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-fg)]">
                Amazon listing preview
              </p>
              <p className="mt-1 font-[Inter,system-ui,sans-serif] text-sm text-[var(--foreground)]">
                <span className="text-[var(--muted-fg)]">Visit the </span>
                <span className="font-medium">{profile.displayName?.trim() || "Your Brand"} Store</span>
              </p>
            </div>

            <FieldLabel>Tagline</FieldLabel>
            <div className="relative flex items-start gap-2">
              <input
                value={profile.tagline ?? ""}
                onChange={(e) => updateProfile({ tagline: e.target.value || null }, "identity")}
                placeholder="Gentle care for sensitive skin — ships fast from the EU"
                className="min-w-0 flex-1 border-0 border-b border-[var(--border)] bg-transparent py-2 text-sm outline-none transition-[border-color] duration-150 placeholder:text-[var(--muted-fg)]/50 focus:border-[var(--brand-primary)]"
              />
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  disabled={generatingTaglines}
                  onClick={() => void generateTaglines()}
                  aria-label="Suggest taglines"
                >
                  {generatingTaglines ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                  )}
                </Button>
                {taglineMenuOpen && taglineSuggestionsList.length ? (
                  <div className="absolute right-0 z-20 mt-1 w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-[var(--shadow-lg)]">
                    {taglineSuggestionsList.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-[var(--muted)]"
                        onClick={() => {
                          updateProfile({ tagline: s }, "identity");
                          setTaglineMenuOpen(false);
                          void saveSection("identity");
                        }}
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="mt-1 w-full text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)]"
                      onClick={() => setTaglineMenuOpen(false)}
                    >
                      Dismiss
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <FieldLabel>Listing language</FieldLabel>
            <div className="flex flex-wrap items-center gap-2">
              {visibleLangs.map((lang) => {
                const active = (profile.language ?? "en") === lang.value;
                return (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => {
                      updateProfile({ language: lang.value }, "identity");
                      void saveSection("identity");
                    }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-[var(--brand-primary)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    <LanguageFlag code={lang.value} className="h-3 w-5 rounded-sm" />
                    {lang.label.split(" ")[0]}
                  </button>
                );
              })}
              {overflowLangs.length ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLangMoreOpen((v) => !v)}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-fg)]"
                  >
                    +{overflowLangs.length} more
                  </button>
                  {langMoreOpen ? (
                    <div className="absolute left-0 z-20 mt-1 min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-[var(--shadow-md)]">
                      {overflowLangs.map((lang) => (
                        <button
                          key={lang.value}
                          type="button"
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-[var(--muted)]"
                          onClick={() => {
                            updateProfile({ language: lang.value }, "identity");
                            setLangMoreOpen(false);
                            void saveSection("identity");
                          }}
                        >
                          <LanguageFlag code={lang.value} className="h-3 w-5 rounded-sm" />
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <FieldLabel hint="Used in lifestyle and packaging shots">Logo</FieldLabel>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverLogo(true);
              }}
              onDragLeave={() => setDragOverLogo(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverLogo(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void uploadLogo(file);
              }}
              className={cn(
                "relative flex h-[60px] w-[120px] items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                dragOverLogo ? "border-[var(--brand-primary)] bg-[var(--accent-soft)]/30" : "border-[var(--border)]",
                profile.logoUrl ? "border-solid p-1" : "bg-[var(--muted)]/10"
              )}
            >
              {profile.logoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.logoUrl} alt="Brand logo" className="max-h-full max-w-full object-contain" />
                  <button
                    type="button"
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--card)] shadow ring-1 ring-[var(--border)]"
                    onClick={() => {
                      updateProfile({ logoUrl: "" }, "identity");
                      void saveSection("identity");
                    }}
                    aria-label="Remove logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : uploadingLogo ? (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-fg)]" />
              ) : (
                <label className="cursor-pointer px-2 text-center text-[11px] text-[var(--muted-fg)]">
                  Drop or click
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && void uploadLogo(e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </SectionReveal>

          <SectionReveal id="brand-section-visual" sectionId="visual" className="space-y-6">
            <div className="flex items-center gap-3">
              <DividerLabel>Visual System</DividerLabel>
              <SaveChip visible={savedSections.has("visual")} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ColorPickerSplit
                label="Primary color"
                hint="Hero accents, CTAs, main callouts"
                value={profile.primaryColor}
                onChange={(hex) => updateProfile({ primaryColor: hex }, "visual")}
                brandPrimary={profile.primaryColor}
              />
              <ColorPickerSplit
                label="Accent color"
                hint="Badges, secondary graphics, EU labels"
                value={profile.secondaryColor}
                onChange={(hex) => updateProfile({ secondaryColor: hex }, "visual")}
                brandPrimary={profile.primaryColor}
              />
            </div>
            <FieldLabel>Visual style preset</FieldLabel>
            <PresetCardGrid
              items={[...VISUAL_STYLE_PRESETS]}
              activeId={activeVisualPreset}
              brandPrimary={profile.primaryColor}
              onSelect={(id) => {
                const preset = VISUAL_STYLE_PRESETS.find((p) => p.id === id);
                if (preset) updateProfile({ brandAesthetic: preset.value }, "visual");
              }}
              renderThumb={(item) => <VisualStyleThumb swatch={item.swatch} />}
            />
          </SectionReveal>

          <SectionReveal id="brand-section-copy" sectionId="copy" className="space-y-6">
            <div className="flex items-center gap-3">
              <DividerLabel>Copy Voice</DividerLabel>
              <SaveChip visible={savedSections.has("copy")} />
            </div>
            <FieldLabel>Who buys from you</FieldLabel>
            <textarea
              value={profile.targetAudience ?? ""}
              onChange={(e) => updateProfile({ targetAudience: e.target.value || null }, "copy")}
              placeholder="Sensitive-skin households shopping Amazon DE & Bol.com"
              rows={2}
              className="min-h-[3.5rem] max-h-48 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm transition-[border-color,box-shadow] duration-150 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-primary)_35%,transparent)]"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <FieldLabel>Tone preset</FieldLabel>
            <PresetCardGrid
              items={[...TONE_PRESETS]}
              activeId={activeTonePreset}
              brandPrimary={profile.primaryColor}
              onSelect={(id) => {
                const preset = TONE_PRESETS.find((p) => p.id === id);
                if (preset) updateProfile({ tone: preset.value }, "copy");
              }}
              renderThumb={(item) => (
                <div className="rounded-md border border-[var(--border)] bg-[var(--muted)]/30 px-2 py-2 text-[11px] leading-snug text-[var(--muted-fg)]">
                  {item.example}
                </div>
              )}
              renderMeta={(item) => item.label}
            />
            <FieldLabel>About your brand</FieldLabel>
            <textarea
              value={profile.brandStory ?? ""}
              onChange={(e) => updateProfile({ brandStory: e.target.value || null }, "copy")}
              placeholder="2–4 sentences: what you sell, who it's for, and how listings should feel."
              rows={3}
              className={cn(
                "min-h-[4.5rem] max-h-48 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm transition-[border-color,box-shadow] duration-150 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-primary)_35%,transparent)]",
                generatingStory && "animate-pulse"
              )}
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={generatingStory || !profile.displayName?.trim()}
              onClick={() => void generateStory()}
            >
              {generatingStory ? (
                <>
                  <span className="inline-flex h-4 w-4 animate-pulse rounded bg-[var(--accent-soft)]" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </SectionReveal>

          <SectionReveal id="brand-section-rules" sectionId="rules" className="space-y-6">
            <div className="flex items-center gap-3">
              <DividerLabel>Generation Rules</DividerLabel>
              <SaveChip visible={savedSections.has("rules")} />
            </div>
            <p className="text-xs text-[var(--muted-fg)]">
              Hard constraints for every image and copy run. Defaults adapt to your language and colors.
            </p>
            <RulesBuilder
              rules={rules}
              onChange={(next) => {
                updateRules(next);
              }}
            />
          </SectionReveal>

          {error ? (
            <p className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">
              {error}
            </p>
          ) : null}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-20">
            <BrandKitPreviewPanel
              profile={previewProfile}
              complete={kitReady}
              checklist={checklist}
            />
          </div>
        </aside>
      </div>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close preview"
            onClick={() => setPreviewOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--background)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-lg)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Live preview</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </div>
            <BrandKitPreviewPanel profile={previewProfile} complete={kitReady} checklist={checklist} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
