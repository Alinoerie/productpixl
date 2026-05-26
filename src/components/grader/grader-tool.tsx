"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { fetchJson } from "@/lib/fetch-json";
import type { GraderResult } from "@/lib/listing-grader";
import Link from "next/link";

export function GraderTool() {
  const [title, setTitle] = useState("");
  const [bullets, setBullets] = useState(["", "", "", "", ""]);
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GraderResult | null>(null);
  const [error, setError] = useState("");

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

  const gradeClass = result ? `grade-${result.grade.toLowerCase()}` : "";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="shadow-[var(--shadow-md)]">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label>Product title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your listing title" />
          </div>
          {bullets.map((b, i) => (
            <div key={i}>
              <Label>Bullet {i + 1}</Label>
              <Input
                value={b}
                onChange={(e) => {
                  const next = [...bullets];
                  next[i] = e.target.value;
                  setBullets(next);
                }}
              />
            </div>
          ))}
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

      <div className="space-y-4">
        {result ? (
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
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
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
                  {result.rufusTips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Button asChild className="w-full">
              <Link href="/login">Fix listing with ProductPixl →</Link>
            </Button>
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
