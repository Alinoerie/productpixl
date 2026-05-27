"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuidePackUnlockForm } from "@/components/marketing/guide-pack-unlock-form";
import {
  ECOMMERCE_GUIDE_BENEFITS,
  ECOMMERCE_GUIDE_HIGHLIGHTS,
  ECOMMERCE_GUIDE_PLATFORMS,
  ECOMMERCE_GUIDE_PLAYBOOKS,
  ECOMMERCE_GUIDE_REST,
  ECOMMERCE_GUIDE_TOTAL_VALUE_EUR,
  formatGuidePriceEur,
} from "@/lib/guide-pack-content";

function PlaybookRow({
  index,
  title,
  originalPriceEur,
  summary,
  dimmed,
}: {
  index: number;
  title: string;
  originalPriceEur: number;
  summary?: string;
  dimmed?: boolean;
}) {
  return (
    <li
      className={`flex gap-3 rounded-xl border border-[var(--border)] p-3 ${dimmed ? "opacity-80" : "bg-[var(--card)]"}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-medium">{title}</p>
          <span className="text-xs text-[var(--muted-fg)] line-through">{formatGuidePriceEur(originalPriceEur)}</span>
          <span className="rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--success)]">
            Free
          </span>
        </div>
        {summary ? <p className="mt-1 text-xs text-[var(--muted-fg)]">{summary}</p> : null}
      </div>
    </li>
  );
}

function GuidePackVisual() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--ink)] via-[#1e1b4b] to-[var(--teal)]/40 p-6 text-white shadow-[var(--shadow-lg)]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--accent)]/20 blur-2xl" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-soft)]">ProductPixl</p>
        <p className="mt-2 font-serif text-2xl leading-tight">Ecommerce guide pack</p>
        <p className="mt-2 text-sm text-white/75">
          {ECOMMERCE_GUIDE_PLATFORMS.join(" · ")}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
          {ECOMMERCE_GUIDE_PLATFORMS.map((platform) => (
            <span
              key={platform}
              className="rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-center font-medium"
            >
              {platform}
            </span>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-white/90">
          <BookOpen className="h-4 w-4 text-[var(--accent-soft)]" />
          10 playbooks · {formatGuidePriceEur(ECOMMERCE_GUIDE_TOTAL_VALUE_EUR)} value
        </p>
      </div>
    </div>
  );
}

export function EcommerceGuidePackSection({ showFullCatalog = false }: { showFullCatalog?: boolean }) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <section data-m-scroll className="border-y border-[var(--border)] bg-[var(--background)] px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-m-stagger className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div data-m-item>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Free guide pack</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
              Unlock the complete guide to ecommerce optimization
            </h2>
            <p className="mt-4 max-w-xl text-[var(--muted-fg)]">
              Get a practical guide to optimize{" "}
              {ECOMMERCE_GUIDE_PLATFORMS.slice(0, -1).join(", ")}, and {ECOMMERCE_GUIDE_PLATFORMS.at(-1)} catalogs with
              AI.
            </p>

            <div className="mt-8">
              <p className="text-sm font-semibold">What you will get</p>
              <ul data-m-stagger className="mt-4 space-y-4">
                {ECOMMERCE_GUIDE_BENEFITS.map((item) => (
                  <li key={item.title} data-m-item className="flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--teal)]" strokeWidth={2.5} />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-0.5 text-sm text-[var(--muted-fg)]">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <GuidePackUnlockForm onUnlocked={() => setUnlocked(true)} />
            </div>
          </div>

          <div data-m-item className="space-y-6">
            <div data-m-float>
              <GuidePackVisual />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                You unlock 10 playbooks
              </p>
              <p className="mt-1 text-xs text-[var(--muted-fg)]">Five highlights from the pack:</p>
              <ol data-m-stagger className="mt-4 space-y-2">
                {ECOMMERCE_GUIDE_HIGHLIGHTS.map((playbook, i) => (
                  <li key={playbook.id} data-m-item>
                    <PlaybookRow
                    key={playbook.id}
                    index={i + 1}
                    title={playbook.title}
                    originalPriceEur={playbook.originalPriceEur}
                    summary={unlocked || showFullCatalog ? playbook.summary : undefined}
                    dimmed={!unlocked && !showFullCatalog}
                  />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {unlocked || showFullCatalog ? (
          <div data-m-scroll className="mt-16 border-t border-[var(--border)] pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Full pack</p>
                <h3 className="mt-2 font-serif text-2xl md:text-3xl">All 10 playbooks — yours free</h3>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted-fg)]">
                  Use these as checklists for catalog audits, channel launches, and AI-assisted content refreshes.
                  ProductPixl handles the image + copy generation when you&apos;re ready to execute.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/login">Start free in ProductPixl</Link>
              </Button>
            </div>
            <ul data-m-stagger className="mt-8 grid gap-3 md:grid-cols-2">
              {ECOMMERCE_GUIDE_PLAYBOOKS.map((playbook, i) => (
                <li key={playbook.id} data-m-item>
                  <PlaybookRow
                  key={playbook.id}
                  index={i + 1}
                  title={playbook.title}
                  originalPriceEur={playbook.originalPriceEur}
                  summary={playbook.summary}
                />
                </li>
              ))}
            </ul>
            {ECOMMERCE_GUIDE_REST.length > 0 ? (
              <p className="mt-6 text-center text-xs text-[var(--muted-fg)]">
                Also included: {ECOMMERCE_GUIDE_REST.map((p) => p.title).join(" · ")}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-[var(--muted-fg)]">
            Enter your email to reveal all 10 playbooks and summaries.
          </p>
        )}
      </div>
    </section>
  );
}

/** Compact CTA for login and footer bands */
export function EcommerceGuidePackTeaser() {
  return (
    <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">Free resource</p>
      <p className="mt-2 font-serif text-xl">Ecommerce optimization guide pack</p>
      <p className="mt-2 text-sm text-[var(--muted-fg)]">
        10 playbooks for Shopify, WooCommerce, PrestaShop & LogiCommerce — {formatGuidePriceEur(ECOMMERCE_GUIDE_TOTAL_VALUE_EUR)}{" "}
        value, free.
      </p>
      <Button asChild size="sm" className="mt-4 rounded-xl">
        <Link href="/guides/ecommerce">Unlock the guide pack →</Link>
      </Button>
    </div>
  );
}
