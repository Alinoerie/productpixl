import Link from "next/link";
import { User } from "lucide-react";
import { auth } from "@/lib/auth";
import { CreditBadge } from "@/components/layout/credit-badge";
import { Button } from "@/components/ui/button";
import { AppShellMobileNav, AppShellNav } from "@/components/layout/app-shell-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const credits = session?.user?.credits ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/95 shadow-[var(--shadow-sm)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-6 md:gap-8">
            <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ink)] text-[10px] font-bold text-white">
                Px
              </span>
              <span className="font-serif text-lg tracking-tight">ProductPixl</span>
            </Link>
            <AppShellNav className="hidden md:flex" />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <CreditBadge initialCredits={credits} />
            <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden" aria-label="Account">
              <Link href="/account">
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href="/account">Account</Link>
            </Button>
          </div>
        </div>
        <AppShellMobileNav />
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-12 md:pb-12">
        {children}
      </main>
    </div>
  );
}
