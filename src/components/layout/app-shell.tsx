import Link from "next/link";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShellMobileNav, AppShellNav } from "@/components/layout/app-shell-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const credits = session?.user?.credits ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/95 shadow-[var(--shadow-sm)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--ink)] text-[10px] font-bold text-white">
                Px
              </span>
              <span className="font-serif text-lg tracking-tight">ProductPixl</span>
            </Link>
            <AppShellNav className="hidden md:flex" />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Badge
                variant="outline"
                className="cursor-pointer border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 text-[var(--accent)]"
              >
                {credits} credits
              </Badge>
            </Link>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/account">Account</Link>
            </Button>
          </div>
        </div>
        <AppShellMobileNav />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">{children}</main>
    </div>
  );
}
