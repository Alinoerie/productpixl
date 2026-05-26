import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AlertBanner({
  message,
  actionHref,
  actionLabel,
}: {
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]">
      <span>{message}</span>
      {actionHref && actionLabel ? (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border-[var(--error-border)] bg-[var(--card)] hover:bg-[var(--error-bg)]"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
