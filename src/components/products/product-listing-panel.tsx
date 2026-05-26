"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CharCounter, LimitWarning } from "@/components/ui/char-counter";
import { useToast } from "@/components/ui/toast-provider";
import { AMAZON_BULLET_MAX, AMAZON_TITLE_MAX } from "@/lib/amazon-limits";

export function ProductListingPanel({
  productId,
  title: initialTitle,
  bullets: initialBullets,
  description: initialDescription,
  keywords: initialKeywords,
}: {
  productId: string;
  title: string;
  bullets: string[];
  description?: string | null;
  keywords?: string | null;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialTitle);
  const [bullets, setBullets] = useState(initialBullets);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [keywords, setKeywords] = useState(initialKeywords ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState({
    title: initialTitle,
    bullets: initialBullets,
    description: initialDescription ?? "",
    keywords: initialKeywords ?? "",
  });

  const titleOver = title.length > AMAZON_TITLE_MAX;

  const isDirty = useMemo(() => {
    return (
      title !== saved.title ||
      JSON.stringify(bullets) !== JSON.stringify(saved.bullets) ||
      description !== saved.description ||
      keywords !== saved.keywords
    );
  }, [title, bullets, description, keywords, saved]);

  const copyAll = async () => {
    const text = [
      title,
      "",
      ...bullets.map((b, i) => `${i + 1}. ${b}`),
      "",
      description,
      "",
      `Keywords: ${keywords}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Listing copy copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}/listing-copy`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          bullets,
          description: description || null,
          backendKeywords: keywords || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved({ title, bullets, description, keywords });
      toast("Listing copy saved");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save copy", "error");
    } finally {
      setSaving(false);
    }
  }, [productId, title, bullets, description, keywords, toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty && !saving) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, saving, save]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">Listing copy</h2>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">
            Edit before export — changes save to this project.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copyAll}>
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy all
              </>
            )}
          </Button>
          <Button type="button" size="sm" disabled={!isDirty || saving} onClick={save}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save changes
              </>
            )}
          </Button>
        </div>
      </div>

      {titleOver ? (
        <div className="mb-4">
          <LimitWarning message={`Title is over Amazon's ${AMAZON_TITLE_MAX}-character limit.`} />
        </div>
      ) : null}

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-base">Title</CardTitle>
            <CharCounter value={title} max={AMAZON_TITLE_MAX} />
          </CardHeader>
          <CardContent>
            <Label htmlFor="listing-title" className="sr-only">
              Listing title
            </Label>
            <Textarea
              id="listing-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-[72px] font-medium"
            />
          </CardContent>
        </Card>

        {bullets.map((b, i) => {
          const bulletOver = b.length > AMAZON_BULLET_MAX;
          return (
            <Card key={`bullet-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-base">Bullet {i + 1}</CardTitle>
                <CharCounter value={b} max={AMAZON_BULLET_MAX} />
              </CardHeader>
              <CardContent>
                {bulletOver ? (
                  <LimitWarning message={`Over ${AMAZON_BULLET_MAX} characters — trim before publishing.`} />
                ) : null}
                <Label htmlFor={`listing-bullet-${i}`} className="sr-only">
                  Bullet {i + 1}
                </Label>
                <Textarea
                  id={`listing-bullet-${i}`}
                  value={b}
                  onChange={(e) => {
                    const next = [...bullets];
                    next[i] = e.target.value;
                    setBullets(next);
                  }}
                />
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="listing-description" className="sr-only">
              Product description
            </Label>
            <Textarea
              id="listing-description"
              className="min-h-[160px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Backend keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="listing-keywords" className="sr-only">
              Backend keywords
            </Label>
            <Input
              id="listing-keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {isDirty ? (
        <p className="mt-4 text-xs text-[var(--muted-fg)]">
          Unsaved edits — press Save or use ⌘/Ctrl+S.
        </p>
      ) : null}
    </section>
  );
}
