import Link from "next/link";
import { MARKETING_FOOTER_LINKS } from "@/lib/marketing-links";
import { USP_ONE_LINER, USP_TAGLINE } from "@/lib/marketing-usp";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ink)] text-xs font-bold text-white">
              Px
            </span>
            <span className="font-serif text-xl">ProductPixl</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-[var(--muted-fg)]">
            <span className="font-medium text-[var(--foreground)]">{USP_TAGLINE}</span>
            <br />
            {USP_ONE_LINER}
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
          {MARKETING_FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--muted-fg)] transition-colors hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--muted-fg)]">
        © {new Date().getFullYear()} ProductPixl · Pay per generation, not per month
      </p>
    </footer>
  );
}
