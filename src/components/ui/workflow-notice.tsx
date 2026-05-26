import Link from "next/link";
import { CreditBadge } from "@/components/layout/credit-badge";
import { Button } from "@/components/ui/button";

export function WorkflowNotice({
  initialCredits,
  costLabel = "1 credit",
  description,
}: {
  initialCredits: number;
  costLabel?: string;
  description: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-[var(--shadow-sm)]">
      <div className="min-w-0">
        <p className="text-sm text-[var(--muted-fg)]">{description}</p>
        <p className="mt-0.5 text-xs font-medium text-[var(--foreground)]">
          This run costs <span className="text-[var(--accent)]">{costLabel}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CreditBadge initialCredits={initialCredits} />
        <Button asChild variant="outline" size="sm">
          <Link href="/pricing">Buy credits</Link>
        </Button>
      </div>
    </div>
  );
}
