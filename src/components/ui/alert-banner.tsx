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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{message}</span>
      {actionHref && actionLabel ? (
        <Button asChild size="sm" variant="outline" className="border-red-300 bg-white hover:bg-red-50">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
