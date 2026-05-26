import Link from "next/link";
import { formatCreditsRequired } from "@/lib/credit-pricing";

export function InsufficientCreditsAlert({
  className,
  required,
  available,
}: {
  className?: string;
  required?: number;
  available?: number;
}) {
  const needText =
    required != null
      ? `You need ${formatCreditsRequired(required)} for this run${
          available != null ? ` (${available.toLocaleString()} available)` : ""
        }.`
      : "You do not have enough credits for this run.";

  return (
    <p
      className={
        className ??
        "rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]"
      }
      role="alert"
    >
      {needText}{" "}
      <Link href="/pricing?locked=1" className="font-medium underline underline-offset-2">
        View pricing
      </Link>
      <span className="mt-1 block text-[var(--muted-fg)]">
        Credit totals adjust with gallery size, marketplace, and product detail — packs are sold in bundles, not at a fixed per-credit rate.
      </span>
    </p>
  );
}
