"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CharCounter, LimitWarning } from "@/components/ui/char-counter";
import { useToast } from "@/components/ui/toast-provider";
import { fetchJson } from "@/lib/fetch-json";
import { AMAZON_BULLET_MAX, AMAZON_TITLE_MAX } from "@/lib/amazon-limits";
import { loadCopyDraft, saveCopyDraft } from "@/lib/copy-draft";
import { STUDIO_ROUTES, studioCopyHref, studioImagesHref } from "@/lib/studio-routes";
import { markProductGraded } from "@/lib/grade-session";
import type { GraderResult } from "@/lib/listing-grader";
import { cn } from "@/lib/utils";

const SAMPLE = {
  title: "Zealots Energizing Liquid Hand Soap — Greek Olive Oil, Mandarin & Basil — 500ml",
  bullets: [
    "Greek bio olive oil base cleanses without stripping natural moisture from busy hands",
    "Energizing mandarin and basil scent — spa-fresh, not overpowering for daily kitchen use",
    "Dermatologically tested formula suitable for frequent hand washing in family households",
    "Recyclable amber bottle with pump — premium look for bathroom or kitchen counter display",
    "Made with naturally derived ingredients — no parabens, silicones, or artificial colorants",
  ],
  description:
    "Transform your daily hand-washing ritual with Zealots Energizing Liquid Hand Soap. Crafted with Greek bio olive oil and a bright mandarin-basil blend, it leaves skin feeling clean, soft, and refreshed.",
  keywords: "hand soap liquid olive oil mandarin basil natural energizing 500ml",
};

export function GraderTool({ signedIn = false }: { signedIn?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [bullets, setBullets] = useState(["", "", "", "", ""]);
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GraderResult | null>(null);
  const [error, setError] = useState("");
  const [tipsCopied, setTipsCopied] = useState(false);
  const [fromProject, setFromProject] = useState(false);
  const [draftProductId, setDraftProductId] = useState<string | null>(null);
  const scoreSummaryRef = useRef<HTMLDivElement>(null);

  const loadSample = () => {
    setTitle(SAMPLE.title);
    setBullets(SAMPLE.bullets);
    setDescription(SAMPLE.description);
    setKeywords(SAMPLE.keywords);
    setResult(null);
    setError("");
  };

  const grade = useCallback(async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { ok, data } = await fetchJson<GraderResult & { error?: string }>("/api/grader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          bullets: bullets.filter((b) => b.trim()),
          description,
          backendKeywords: keywords,
          productId: draftProductId ?? undefined,
        }),
      });
      if (!ok) throw new Error((data as { error?: string }).error || "Failed");
      const graded = data as GraderResult;
      setResult(graded);
      if (draftProductId) {
        markProductGraded(draftProductId, { grade: graded.grade, score: graded.score });
      }
      toast(`Grade ${graded.grade} — ${graded.score}/100`);
      requestAnimationFrame(() => {
        scoreSummaryRef.current?.focus();
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        resultsRef.current?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: isMobile ? "center" : "start",
        });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grading failed");
    } finally {
      setLoading(false);
    }
  }, [title, bullets, description, keywords, draftProductId, toast]);

  useEffect(() => {
    const draft = loadCopyDraft();
    if (!draft?.title) return;
    setTitle(draft.title);
    const loaded = draft.bullets ?? [];
    setBullets([loaded[0] ?? "", loaded[1] ?? "", loaded[2] ?? "", loaded[3] ?? "", loaded[4] ?? ""]);
    setDescription(draft.description ?? "");
    setKeywords(draft.backendKeywords ?? "");
    setDraftProductId(draft.productId ?? null);
    setFromProject(true);
    setResult(null);
    setError("");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && title.trim() && !loading) {
        e.preventDefault();
        void grade();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [title, loading, grade]);

  const copyTips = async () => {
    if (!result) return;
    const text = [
      `Grade: ${result.grade} (${result.score}/100)`,
      result.summary,
      "",
      ...result.checks.map((c) => `• ${c.label}: ${c.tip}`),
      "",
      "RUFUS tips:",
      ...result.rufusTips.map((t) => `• ${t}`),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setTipsCopied(true);
    toast("Improvement checklist copied");
    setTimeout(() => setTipsCopied(false), 2000);
  };

  const openInCopyStudio = () => {
    saveCopyDraft({
      title,
      bullets: bullets.filter((b) => b.trim()),
      description,
      backendKeywords: keywords,
      productId: draftProductId ?? undefined,
    });
    router.push(draftProductId ? studioCopyHref(draftProductId) : STUDIO_ROUTES.copy);
  };

  const fixListingWithProductPixl = () => {
    saveCopyDraft({
      title,
      bullets: bullets.filter((b) => b.trim()),
      description,
      backendKeywords: keywords,
      productId: draftProductId ?? undefined,
    });
    const callbackUrl = draftProductId ? studioCopyHref(draftProductId) : STUDIO_ROUTES.copy;
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const returnToProject = () => {
    if (!draftProductId) return;
    router.push(`/products/${draftProductId}`);
    router.refresh();
  };

  const generateHref = draftProductId ? studioImagesHref({ productId: draftProductId }) : STUDIO_ROUTES.images;

  const gradeClass = result ? `grade-${result.grade.toLowerCase()}` : "";
  const titleOver = title.length > AMAZON_TITLE_MAX;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {fromProject ? (
        <p className="lg:col-span-2 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-soft)]/40 px-4 py-3 text-sm">
          Loaded listing from your project — edit fields and re-grade, or open in Copy studio to apply fixes.
          <button
            type="button"
            className="ml-2 font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            onClick={() => setFromProject(false)}
          >
            Dismiss
          </button>
        </p>
      ) : null}
      <Card className={cn("shadow-[var(--shadow-md)]", !signedIn && "mb-24 md:mb-0")}>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[var(--muted-fg)]">Paste your Amazon listing copy</p>
            <Button type="button" variant="outline" size="sm" onClick={loadSample}>
              Load sample listing
            </Button>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="grader-title">Product title</Label>
              <CharCounter id="grader-title-counter" value={title} max={AMAZON_TITLE_MAX} />
            </div>
            {titleOver ? (
              <LimitWarning
                id="grader-title-warning"
                message={`Title is over Amazon's ${AMAZON_TITLE_MAX}-character limit.`}
              />
            ) : null}
            <Input
              id="grader-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your listing title"
              aria-describedby={titleOver ? "grader-title-counter grader-title-warning" : "grader-title-counter"}
              aria-invalid={titleOver || undefined}
            />
            {!title.trim() ? (
              <p className="mt-1 text-xs text-[var(--muted-fg)]">Enter a title to grade your listing.</p>
            ) : null}
          </div>
          {bullets.map((b, i) => {
            const bulletOver = b.length > AMAZON_BULLET_MAX;
            return (
            <div key={`bullet-${i}`}>
              <div className="flex items-center justify-between">
                <Label htmlFor={`grader-bullet-${i}`}>Bullet {i + 1}</Label>
                <CharCounter id={`grader-bullet-${i}-counter`} value={b} max={AMAZON_BULLET_MAX} />
              </div>
              {bulletOver ? (
                <LimitWarning
                  id={`grader-bullet-${i}-warning`}
                  message={`Over ${AMAZON_BULLET_MAX} characters — trim before publishing.`}
                />
              ) : null}
              <Textarea
                id={`grader-bullet-${i}`}
                value={b}
                maxLength={500}
                rows={2}
                onChange={(e) => {
                  const next = [...bullets];
                  next[i] = e.target.value;
                  setBullets(next);
                }}
                aria-describedby={
                  bulletOver
                    ? `grader-bullet-${i}-counter grader-bullet-${i}-warning`
                    : `grader-bullet-${i}-counter`
                }
                aria-invalid={bulletOver || undefined}
              />
            </div>
          );
          })}
          <div>
            <Label htmlFor="grader-description">Description (optional)</Label>
            <Textarea
              id="grader-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="grader-keywords">Backend keywords (optional)</Label>
            <Input
              id="grader-keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          {error ? (
            <p className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">
              {error}
            </p>
          ) : null}
          <Button className="hidden w-full md:inline-flex" size="lg" onClick={grade} disabled={loading || !title.trim()}>
            {loading ? "Grading…" : "Grade my listing"}
          </Button>
          <p className="text-center text-xs text-[var(--muted-fg)]">Tip: ⌘/Ctrl+Enter to grade</p>
        </CardContent>
      </Card>

      <div
        className={cn(
          "fixed inset-x-0 z-30 border-t border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-md md:hidden",
          signedIn
            ? "bottom-[var(--mobile-nav-offset)]"
            : "bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        )}
      >
        <Button className="w-full" size="lg" onClick={grade} disabled={loading || !title.trim()}>
          {loading ? "Grading…" : "Grade my listing"}
        </Button>
      </div>

      <div ref={resultsRef} className="scroll-mt-28 space-y-4 md:scroll-mt-8" aria-live="polite" aria-busy={loading}>
        {loading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : result ? (
          <>
            <Card className="overflow-hidden">
              <CardContent className="flex items-center gap-6 p-6">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl font-serif text-4xl font-bold ${gradeClass}`}
                  aria-hidden="true"
                >
                  {result.grade}
                </div>
                <div
                  ref={scoreSummaryRef}
                  tabIndex={-1}
                  className="outline-none"
                  role="status"
                  aria-label={`Listing grade ${result.grade}, score ${result.score} out of 100`}
                >
                  <p className="text-3xl font-semibold">{result.score}/100</p>
                  <p className="mt-1 text-[var(--muted-fg)]">{result.summary}</p>
                </div>
              </CardContent>
            </Card>
            {result.checks.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{c.label}</span>
                    <span>
                      {c.score}/{c.max}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"
                    role="progressbar"
                    aria-valuenow={c.score}
                    aria-valuemin={0}
                    aria-valuemax={c.max}
                    aria-label={c.label}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${(c.score / c.max) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted-fg)]">{c.tip}</p>
                </CardContent>
              </Card>
            ))}
            <Card className="border-[var(--teal)]/30 bg-[var(--teal-soft)]">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-[var(--teal)]">RUFUS / COSMO tips</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ink-muted)]">
                  {result.rufusTips.map((t, i) => (
                    <li key={`rufus-${i}`}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button type="button" variant="outline" className="flex-1" onClick={copyTips}>
                {tipsCopied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied checklist
                  </>
                ) : (
                  "Copy improvement checklist"
                )}
              </Button>
              {signedIn ? (
                <>
                  <Button type="button" className="flex-1" onClick={openInCopyStudio}>
                    Open in Copy studio
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={generateHref}>Generate gallery</Link>
                  </Button>
                  {draftProductId ? (
                    <Button type="button" variant="outline" className="flex-1" onClick={returnToProject}>
                      Return to project
                    </Button>
                  ) : null}
                </>
              ) : (
                <Button type="button" className="flex-1" onClick={fixListingWithProductPixl}>
                  Fix listing with ProductPixl →
                </Button>
              )}
            </div>
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-[var(--muted-fg)]">
              Paste your listing copy and get an A–F score with actionable fixes — free, no login.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
