"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { STUDIO_ROUTES, studioImagesHref } from "@/lib/studio-routes";
import {
  TEMPLATE_FILTER_OPTIONS,
  VISUAL_TEMPLATE_CATALOG,
  type VisualTemplate,
} from "@/lib/templates/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NextStepGuide } from "@/components/ui/next-step-guide";

function matchesFilters(template: VisualTemplate, filters: {
  category: string;
  channel: string;
  industry: string;
  text: string;
  query: string;
}) {
  if (filters.category !== "all" && template.category !== filters.category) return false;
  if (filters.channel !== "all" && template.channel !== filters.channel) return false;
  if (filters.industry !== "all" && template.industry !== filters.industry) return false;
  if (filters.text === "with-text" && !template.hasText) return false;
  if (filters.text === "no-text" && template.hasText) return false;
  if (filters.query) {
    const hay = `${template.title} ${template.description} ${template.tags.join(" ")}`.toLowerCase();
    if (!hay.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

export function TemplatesLibrary() {
  const [category, setCategory] = useState("all");
  const [channel, setChannel] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [text, setText] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      VISUAL_TEMPLATE_CATALOG.filter((template) =>
        matchesFilters(template, { category, channel, industry, text, query })
      ),
    [category, channel, industry, text, query]
  );

  return (
    <div className="space-y-8">
      <NextStepGuide
        step="Use a template"
        title="Filter, preview, then use template"
        body="Pick a layout below. We'll open Content studio → Images with template direction + your active brand colors and tone baked into prompts."
        actionHref="#template-filters"
        actionLabel="Filter templates"
        secondaryHref={STUDIO_ROUTES.brandProfile}
        secondaryLabel="Edit brand profile"
        variant="accent"
      />

      <div id="template-filters" className="scroll-mt-24 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm">
            {TEMPLATE_FILTER_OPTIONS.categories.map((value) => (
              <option key={value} value={value}>{value === "all" ? "All categories" : value}</option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Channel</span>
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm">
            {TEMPLATE_FILTER_OPTIONS.channels.map((value) => (
              <option key={value} value={value}>{value === "all" ? "All channels" : value}</option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Industry</span>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm">
            {TEMPLATE_FILTER_OPTIONS.industries.map((value) => (
              <option key={value} value={value}>{value === "all" ? "All industries" : value}</option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Text</span>
          <select value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm">
            <option value="all">All</option>
            <option value="with-text">With text</option>
            <option value="no-text">No text</option>
          </select>
        </label>
        <label className="text-xs md:col-span-2 lg:col-span-1">
          <span className="mb-1 block font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="benefits, lifestyle…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </label>
      </div>

      <p className="text-sm text-[var(--muted-fg)]">{filtered.length} template{filtered.length === 1 ? "" : "s"}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((template) => (
          <Card key={template.slug}>
            <CardContent className="p-6">
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-soft)] to-[var(--teal-soft)] text-center text-xs font-medium text-[var(--muted-fg)]">
                {template.format.toUpperCase()} · {template.hasText ? "Text layout" : "Visual only"}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{template.channel}</p>
              <h2 className="mt-1 font-serif text-xl">{template.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted-fg)]">{template.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href={studioImagesHref({ template: template.slug })}>
                  Use template
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
