import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/80 bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ink)] text-xs font-bold text-white">
            Px
          </span>
          <span className="font-serif text-xl tracking-tight">ProductPixl</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted-fg)] md:flex">
          <a href="#workflow" className="hover:text-[var(--foreground)]">
            How it works
          </a>
          <a href="#gallery" className="hover:text-[var(--foreground)]">
            Gallery
          </a>
          <a href="#europe" className="hover:text-[var(--foreground)]">
            EU & Bol
          </a>
          <Link href="/grader" className="hover:text-[var(--teal)]">
            Free grader
          </Link>
          <a href="#compare" className="hover:text-[var(--foreground)]">
            Why us
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Open studio</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Start free — 10 credits</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
