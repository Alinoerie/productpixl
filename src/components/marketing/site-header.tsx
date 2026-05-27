import Link from "next/link";
import { STUDIO_ROUTES } from "@/lib/studio-routes";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MarketingMobileNav } from "@/components/marketing/marketing-mobile-nav";
import { MARKETING_NAV_LINKS } from "@/lib/marketing-links";
import { ProductPixlWordmark } from "@/components/brand/productpixl-logo";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/80 bg-[var(--background)]/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <ProductPixlWordmark size={44} />
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-[var(--muted-fg)] lg:flex">
          {MARKETING_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hover:text-[var(--foreground)]",
                link.highlight === "teal" && "text-[var(--teal)] hover:text-[var(--teal)]",
                link.highlight === "accent" && "text-[var(--accent)] hover:text-[var(--accent)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <MarketingMobileNav signedIn={!!session} />
          {session ? (
            <Button asChild size="sm">
              <Link href={STUDIO_ROUTES.home}>Open studio</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="min-h-11 px-2 sm:px-3">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="min-h-11">
                <Link href="/login">
                  <span className="hidden sm:inline">Start free — 10 credits</span>
                  <span className="sm:hidden">Start free</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
