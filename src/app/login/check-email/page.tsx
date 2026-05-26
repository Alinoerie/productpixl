import Link from "next/link";
import { Mail } from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export default function CheckEmailPage() {
  return (
    <MarketingPageShell>
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-20">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[var(--shadow-lg)] md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
            <Mail className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <h1 className="mt-6 font-serif text-3xl">Check your email</h1>
          <p className="mt-3 text-[var(--muted-fg)]">
            We sent you a sign-in link. Click it to open your studio — the link expires in 24 hours.
          </p>
          <p className="mt-6 text-sm text-[var(--muted-fg)]">
            Wrong inbox?{" "}
            <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Try again
            </Link>
          </p>
        </div>
      </section>
    </MarketingPageShell>
  );
}
