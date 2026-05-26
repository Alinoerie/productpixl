"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CharCounter, LimitWarning } from "@/components/ui/char-counter";
import { useToast } from "@/components/ui/toast-provider";
import { useProductEdit } from "@/components/products/product-edit-context";
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
  const edit = useProductEdit();
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

  const copyField = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    toast(`${label} copied`);
  };

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
    edit?.setListingSaving(true);
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
      edit?.setListingSaving(false);
    }
  }, [productId, title, bullets, description, keywords, toast, edit]);

  useEffect(() => {
    edit?.registerListingSave(save);
  }, [edit, save]);

  useEffect(() => {
    edit?.setListingDirty(isDirty);
  }, [edit, isDirty]);

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
    <section id="listing" className="scroll-mt-24">
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
          <Button
            type="button"
            size="sm"
            disabled={!isDirty || saving}
            onClick={save}
            className={isDirty ? "hidden md:inline-flex" : undefined}
          >
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
            <div className="flex items-center gap-2">
              <CharCounter value={title} max={AMAZON_TITLE_MAX} />
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => copyField("Title", title)}>
                <Copy className="h-3.5 w-3.5" />
                <span className="sr-only">Copy title</span>
              </Button>
            </div>
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

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--muted-fg)]">Bullets</p>
          {bullets.length < 5 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => setBullets([...bullets, ""])}
            >
              <Plus className="h-4 w-4" />
              Add bullet
            </Button>
          ) : null}
        </div>

        <details className="rounded-2xl border border-[var(--border)] bg-[var(--card)] md:contents">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 marker:content-none md:hidden [&::-webkit-details-marker]:hidden">
            <span className="text-sm font-medium">Bullets ({bullets.length})</span>
            <span className="text-xs text-[var(--muted-fg)]">Tap to expand</span>
          </summary>
          <div className="space-y-4 border-t border-[var(--border)] p-4 pt-3 md:contents md:border-0 md:p-0">
            {bullets.length < 5 ? (
              <div className="flex justify-end md:hidden">
                <Button type="button" variant="outline" size="sm" onClick={() => setBullets([...bullets, ""])}>
                  <Plus className="h-4 w-4" />
                  Add bullet
                </Button>
              </div>
            ) : null}
            {bullets.map((b, i) => {
          const bulletOver = b.length > AMAZON_BULLET_MAX;
          return (
            <Card key={`bullet-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-base">Bullet {i + 1}</CardTitle>
                <div className="flex items-center gap-1">
                  <CharCounter value={b} max={AMAZON_BULLET_MAX} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyField(`Bullet ${i + 1}`, b)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="sr-only">Copy bullet {i + 1}</span>
                  </Button>
                  {bullets.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[var(--muted-fg)] hover:text-[var(--error)]"
                      onClick={() => setBullets(bullets.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Remove bullet {i + 1}</span>
                    </Button>
                  ) : null}
                </div>
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
          </div>
        </details>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-base">Description</CardTitle>
            {description ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => copyField("Description", description)}
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="sr-only">Copy description</span>
              </Button>
            ) : null}
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
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-base">Backend keywords</CardTitle>
            {keywords ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => copyField("Keywords", keywords)}
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="sr-only">Copy keywords</span>
              </Button>
            ) : null}
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
          Unsaved edits — save from the bar below on mobile, or use Save / ⌘/Ctrl+S on desktop.
        </p>
      ) : null}
    </section>
  );
}
