"use client";

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  FileText,
  Layers,
  Lock,
  Palette,
  PenLine,
  PlayCircle,
  Sparkles,
  Wand2,
} from "lucide-react";
import { CountUpStat } from "@/components/studio/count-up-stat";
import { CreditChip } from "@/components/studio/credit-chip";
import { Button } from "@/components/ui/button";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { typicalCopyRunCredits, typicalImageRunCredits } from "@/lib/credit-pricing";
import { cn } from "@/lib/utils";
import { STUDIO_TRANSITION } from "@/lib/studio-motion";
import { useStaggerReveal } from "@/hooks/use-studio-gsap";

type RecentProject = {
  id: string;
  name: string;
  status: string;
  thumb?: string | null;
  hasCopy: boolean;
  hasImages: boolean;
};

export function StudioOverview({
  userName,
  brandName,
  credits,
  totalProjects,
  exportReady,
  brandCount,
  recentProjects,
}: {
  userName: string;
  brandName: string;
  credits: number;
  totalProjects: number;
  exportReady: number;
  brandCount: number;
  recentProjects: RecentProject[];
}) {
  const imageCredits = typicalImageRunCredits();
  const copyCredits = typicalCopyRunCredits();
  const locked = totalProjects === 0;
  const launchRef = useStaggerReveal([userName, credits]);

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div ref={launchRef} className="space-y-6">
          <div>
            <h1 className="font-serif text-4xl tracking-tight md:text-5xl">Hi {userName}</h1>
            <p className="mt-2 text-[var(--muted-fg)]">
              <span className="font-medium text-[var(--foreground)]">{brandName}</span> ·{" "}
              <CountUpStat value={credits} className="font-semibold text-[var(--foreground)]" /> credits ready
            </p>
          </div>

          <QuickLaunchCard
            href={STUDIO_ROUTES.images}
            icon={Camera}
            title="Images"
            description="Hero, lifestyle, and detail gallery modules from one upload."
            credits={imageCredits}
            gradient="from-[#6366f1]/20 via-[#818cf8]/10 to-[#0891b2]/20"
            mockup={<ImagesMockup />}
            stagger
          />
          <QuickLaunchCard
            href={STUDIO_ROUTES.aplus}
            icon={Layers}
            title="A+ Content"
            description="Amazon A+ modules M1–M15 at exact pixel dimensions — premium modules for Brand Registered."
            credits={imageCredits + 12}
            gradient="from-[#0d9488]/20 via-[#14b8a6]/10 to-[#6366f1]/15"
            mockup={<ImagesMockup />}
            variant="outline"
            stagger
          />
          <QuickLaunchCard
            href={STUDIO_ROUTES.copy}
            icon={FileText}
            title="Copy"
            description="Title, bullets, description, and backend keywords — RUFUS-ready."
            credits={copyCredits}
            gradient="from-[#0891b2]/20 via-[#06b6d4]/10 to-[#6366f1]/15"
            mockup={<CopyMockup />}
            variant="outline"
            stagger
          />
          <QuickLaunchCard
            href={STUDIO_ROUTES.video}
            icon={PlayCircle}
            title="Video"
            description="Shoppable reels for TikTok, Amazon video, and Reels."
            credits={85}
            gradient="from-[#7c3aed]/20 via-[#a855f7]/10 to-[#6366f1]/15"
            mockup={<VideoMockup />}
            badge="Beta"
            variant="outline"
            stagger
          />

          <Link
            href="/grader"
            data-stagger-item
            className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-4 transition-colors hover:border-[var(--border-strong)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card)]">
              <Wand2 className="h-5 w-5 text-[var(--muted-fg)]" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Free listing grader</p>
              <p className="text-sm text-[var(--muted-fg)]">Score any PDP — no credits required</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--muted-fg)]" />
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Credits", value: credits, icon: Sparkles, href: STUDIO_ROUTES.pricing },
              { label: "Projects", value: totalProjects, icon: Camera, href: STUDIO_ROUTES.projects },
              { label: "Export-ready", value: exportReady, icon: FileText, href: `${STUDIO_ROUTES.projects}?ready=export` },
              { label: "Brands", value: brandCount, icon: Palette, href: STUDIO_ROUTES.brandsList },
            ].map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <stat.icon className="h-4 w-4 text-[var(--muted-fg)]" />
                <p className="mt-3 font-serif text-3xl tabular-nums">
                  <CountUpStat value={stat.value} />
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-fg)]">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent work</h2>
              {totalProjects > 0 ? (
                <Link href={STUDIO_ROUTES.projects} className="text-xs font-medium text-[var(--accent)]">
                  All projects →
                </Link>
              ) : null}
            </div>
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <svg viewBox="0 0 80 80" className="h-16 w-16 text-[var(--muted-fg)]" aria-hidden>
                  <rect x="16" y="24" width="48" height="40" rx="4" fill="currentColor" opacity="0.15" />
                  <path d="M28 36h24M28 44h16" stroke="currentColor" strokeWidth="2" opacity="0.35" />
                  <path d="M52 20l4 4-8 8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
                </svg>
                <p className="mt-4 font-medium">Your first project is one upload away</p>
                <Button asChild className="mt-4">
                  <Link href={STUDIO_ROUTES.images}>Start in Images</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentProjects.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-2 transition-colors hover:bg-[var(--muted)]/30"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
                        {p.thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.thumb} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.hasImages ? (
                            <span className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                              Images
                            </span>
                          ) : null}
                          {p.hasCopy ? (
                            <span className="rounded bg-[var(--teal-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--teal)]">
                              Copy
                            </span>
                          ) : null}
                          <StatusChip status={p.status} />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div
            className={cn(
              "rounded-2xl border p-4",
              locked
                ? "border-[var(--border)] bg-[var(--muted)]/20"
                : "border-[var(--accent)]/20 bg-[var(--accent-soft)]/20"
            )}
          >
            <div className="flex items-start gap-3">
              {locked ? <Lock className="mt-0.5 h-4 w-4 text-[var(--muted-fg)]" /> : <Sparkles className="mt-0.5 h-4 w-4 text-[var(--accent)]" />}
              <div>
                <p className="text-sm font-medium">Batch tools & playbooks</p>
                <p className="mt-1 text-xs text-[var(--muted-fg)]">
                  {locked
                    ? "Unlocks after your first project — run Images or Copy to get started."
                    : "Available in the sidebar under Batch and Playbooks."}
                </p>
                {locked ? (
                  <span className="mt-2 inline-flex rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--warning)]">
                    Unlocks after first project
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-fg)]">
          Studio launcher
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: STUDIO_ROUTES.images, icon: Camera, label: "Images", desc: "Gallery modules" },
            { href: STUDIO_ROUTES.copy, icon: FileText, label: "Copy", desc: "Listing text" },
            { href: "/grader", icon: Wand2, label: "Grader", desc: "Free score" },
            { href: STUDIO_ROUTES.brandProfile, icon: Palette, label: "Brand Kit", desc: "Voice & colors" },
          ].map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className={cn(
                "group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] motion-reduce:transform-none",
                STUDIO_TRANSITION.lift
              )}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--muted)]/40">
                <tile.icon className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <p className="mt-4 font-medium">{tile.label}</p>
              <p className="text-xs text-[var(--muted-fg)]">{tile.desc}</p>
              <ArrowRight className="mt-2 h-4 w-4 text-[var(--muted-fg)] opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickLaunchCard({
  href,
  icon: Icon,
  title,
  description,
  credits,
  gradient,
  mockup,
  badge,
  variant = "default",
  stagger = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  credits: number;
  gradient: string;
  mockup: React.ReactNode;
  badge?: string;
  variant?: "default" | "outline";
  stagger?: boolean;
}) {
  return (
    <Link
      href={href}
      data-stagger-item={stagger ? true : undefined}
      className={cn(
        "group block overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] motion-reduce:transform-none",
        STUDIO_TRANSITION.lift,
        variant === "default" ? "border-[var(--accent)]/25 bg-[var(--card)]" : "border-[var(--border)] bg-[var(--card)]"
      )}
    >
      <div className={cn("relative h-28 bg-gradient-to-br p-4", gradient)}>{mockup}</div>
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="font-serif text-xl">{title}</h2>
          {badge ? (
            <span className="rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--warning)]">
              {badge}
            </span>
          ) : null}
          <CreditChip credits={credits} className="ml-auto" />
        </div>
        <p className="text-sm text-[var(--muted-fg)]">{description}</p>
        <span className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-medium text-white group-hover:bg-[var(--accent-hover)]">
          Open {title.toLowerCase()}
          <ArrowRight className="ml-2 h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETE: "Export-ready",
    PROCESSING: "In progress",
    QUEUED: "In progress",
    FAILED: "Draft",
    DRAFT: "Draft",
  };
  const label = map[status] ?? "Draft";
  return (
    <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-fg)]">
      {label}
    </span>
  );
}

function ImagesMockup() {
  return (
    <svg viewBox="0 0 200 80" className="h-full w-full opacity-80" aria-hidden>
      <rect x="8" y="12" width="55" height="55" rx="6" fill="#fff" opacity="0.9" />
      <rect x="72" y="18" width="55" height="49" rx="6" fill="#fff" opacity="0.7" />
      <rect x="136" y="22" width="55" height="45" rx="6" fill="#fff" opacity="0.5" />
    </svg>
  );
}

function CopyMockup() {
  return (
    <svg viewBox="0 0 200 80" className="h-full w-full opacity-80" aria-hidden>
      <rect x="12" y="14" width="120" height="8" rx="2" fill="#fff" opacity="0.9" />
      <rect x="12" y="28" width="160" height="4" rx="1" fill="#fff" opacity="0.6" />
      <rect x="12" y="36" width="140" height="4" rx="1" fill="#fff" opacity="0.5" />
      <rect x="12" y="44" width="150" height="4" rx="1" fill="#fff" opacity="0.4" />
    </svg>
  );
}

function VideoMockup() {
  return (
    <svg viewBox="0 0 200 80" className="h-full w-full opacity-80" aria-hidden>
      <rect x="70" y="8" width="60" height="64" rx="8" fill="#fff" opacity="0.85" />
      <polygon points="92,28 92,52 112,40" fill="#6366f1" opacity="0.8" />
    </svg>
  );
}
