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
      <Link href="/pricing" className="font-medium underline underline-offset-2">
        Buy credits
      </Link>
    </p>
  );
}
