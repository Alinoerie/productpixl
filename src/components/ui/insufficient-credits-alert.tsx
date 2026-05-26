import Link from "next/link";

export function InsufficientCreditsAlert({ className }: { className?: string }) {
  return (
    <p
      className={
        className ??
        "rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]"
      }
      role="alert"
    >
      You need at least 1 credit for this run.{" "}
      <Link href="/pricing?locked=1" className="font-medium underline underline-offset-2">
        View pricing
      </Link>
      <span className="mt-1 block text-[var(--muted-fg)]">
        Credit packs are listed on pricing; Stripe checkout is a placeholder until billing goes live.
      </span>
    </p>
  );
}
