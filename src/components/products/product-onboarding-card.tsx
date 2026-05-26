import Link from "next/link";
import { Camera, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: Camera,
    title: "Gallery images",
    detail: "Hero, lifestyle, and detail shots — credits scale with modules and product depth.",
    href: (id: string) => `/generate?productId=${id}`,
    cta: "Start image run",
    primary: true,
  },
  {
    icon: FileText,
    title: "Listing copy",
    detail: "RUFUS-ready title, bullets, and keywords — estimate shown in copy studio.",
    href: (id: string) => `/copy?productId=${id}`,
    cta: "Generate copy",
    primary: false,
  },
  {
    icon: Package,
    title: "Grade & export",
    detail: "Free A–F grader, then download images and copy together.",
    href: () => "#export",
    cta: "Preview export hub",
    primary: false,
  },
] as const;

export function ProductOnboardingCard({ productId }: { productId: string }) {
  return (
    <Card className="overflow-hidden border-[var(--accent)]/25 bg-[var(--accent-soft)]/20">
      <CardContent className="p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">New project</p>
        <h2 className="mt-2 font-serif text-xl md:text-2xl">Get export-ready in three steps</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted-fg)]">
          This project is empty — start with images or copy, grade when ready, then export from the hub below.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)]">
                    {index + 1}
                  </span>
                  <Icon className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.5} />
                  {step.title}
                </div>
                <p className="mt-3 text-sm text-[var(--muted-fg)]">{step.detail}</p>
                <Button
                  asChild
                  size="sm"
                  variant={step.primary ? "default" : "outline"}
                  className="mt-4 w-full"
                >
                  <Link href={step.href(productId)}>{step.cta}</Link>
                </Button>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
