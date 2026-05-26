"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchJson } from "@/lib/fetch-json";
import { AMAZON_BULLET_MAX, AMAZON_TITLE_MAX, charCountLabel } from "@/lib/amazon-limits";
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
  const [title, setTitle] = useState("");
  const [bullets, setBullets] = useState(["", "", "", "", ""]);
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GraderResult | null>(null);
  const [error, setError] = useState("");
  const [tipsCopied, setTipsCopied] = useState(false);

  const loadSample = () => {
    setTitle(SAMPLE.title);
    setBullets(SAMPLE.bullets);
    setDescription(SAMPLE.description);
    setKeywords(SAMPLE.keywords);
    setResult(null);
    setError("");
  };

  const grade = async () => {
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
        }),
      });
      if (!ok) throw new Error((data as { error?: string }).error || "Failed");
      setResult(data as GraderResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grading failed");
    } finally {
      setLoading(false);
    }
  };

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
    setTimeout(() => setTipsCopied(false), 2000);
  };

  const gradeClass = result ? `grade-${result.grade.toLowerCase()}` : "";
  const titleCount = charCountLabel(title, AMAZON_TITLE_MAX);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="shadow-[var(--shadow-md)]">
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
              <span
                className={cn(
                  "text-xs tabular-nums",
                  titleCount.over ? "font-medium text-red-600" : "text-[var(--muted-fg)]"
                )}
              >
                {titleCount.label}
              </span>
            </div>
            <Input
              id="grader-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your listing title"
            />
          </div>
          {bullets.map((b, i) => {
            const bulletCount = charCountLabel(b, AMAZON_BULLET_MAX);
            return (
              <div key={`bullet-${i}`}>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`grader-bullet-${i}`}>Bullet {i + 1}</Label>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      bulletCount.over ? "font-medium text-red-600" : "text-[var(--muted-fg)]"
                    )}
                  >
                    {bulletCount.label}
                  </span>
                </div>
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
                />
              </div>
            );
          })}
          <div>
            <Label>Description (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Backend keywords (optional)</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" size="lg" onClick={grade} disabled={loading || !title.trim()}>
            {loading ? "Grading…" : "Grade my listing"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4" aria-live="polite" aria-busy={loading}>
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
                >
                  {result.grade}
                </div>
                <div>
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1" onClick={copyTips}>
                {tipsCopied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied checklist
                  </>
                ) : (
                  "Copy improvement checklist"
                )}
              </Button>
              <Button asChild className="flex-1">
                <Link href={signedIn ? "/generate" : "/login"}>
                  {signedIn ? "Generate gallery + copy →" : "Fix listing with ProductPixl →"}
                </Link>
              </Button>
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
