"use client";

import Link from "next/link";
import { Camera, CreditCard, FileText, Lock, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasPaidCredits } from "@/lib/credits-access";

const actions = [
  {
    href: "/generate",
    label: "Image studio",
    desc: "PHOILA pipeline · 1 credit",
    icon: Camera,
    accent: "text-[var(--accent)] bg-[var(--accent-soft)]",
    requiresCredits: true,
  },
  {
    href: "/copy",
    label: "Listing copy",
    desc: "Title, bullets, keywords",
    icon: FileText,
    accent: "text-[var(--teal)] bg-[var(--teal-soft)]",
    requiresCredits: true,
  },
  {
    href: "/grader",
    label: "Free grader",
    desc: "Score before you publish",
    icon: Sparkles,
    accent: "text-[var(--ink)] bg-[var(--muted)]",
    requiresCredits: false,
  },
  {
    href: "/brand",
    label: "Brand profile",
    desc: "Colors & tone for every run",
    icon: Palette,
    accent: "text-[var(--accent)] bg-[var(--accent-soft)]",
    requiresCredits: false,
  },
];

export function QuickActions({ credits, className }: { credits: number; className?: string }) {
  const locked = !hasPaidCredits(credits);
  const lowCredits = credits < 2 && !locked;

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {locked ? (
        <Link
          href="/pricing?locked=1"
          className="group flex items-start gap-4 rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] sm:col-span-2 lg:col-span-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--card)] text-[var(--warning)]">
            <Lock className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-[var(--warning)]">Free credits used</span>
            <span className="mt-0.5 block text-xs text-[var(--muted-fg)]">
              Image studio and copy are locked. View pricing — Stripe checkout is coming soon.
            </span>
          </span>
        </Link>
      ) : lowCredits ? (
        <Link
          href="/pricing?locked=1"
          className="group flex items-start gap-4 rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4 shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] sm:col-span-2 lg:col-span-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--card)] text-[var(--warning)]">
            <CreditCard className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-[var(--warning)]">Top up credits</span>
            <span className="mt-0.5 block text-xs text-[var(--muted-fg)]">
              {credits} left — buy a pack before your next image or copy run
            </span>
          </span>
        </Link>
      ) : null}
      {actions.map((action) => {
        const href =
          locked && action.requiresCredits ? "/pricing?locked=1" : action.href;
        return (
          <Link
            key={action.href}
            href={href}
            className={cn(
              "group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent)]/35 hover:shadow-[var(--shadow-md)]",
              locked && action.requiresCredits && "opacity-60"
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                action.accent
              )}
            >
              <action.icon className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold group-hover:text-[var(--accent)]">{action.label}</span>
              <span className="mt-0.5 block text-xs text-[var(--muted-fg)]">
                {locked && action.requiresCredits ? "Locked — view pricing" : action.desc}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
