import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#0F0E0D]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: wordmark */}
          <span
            className="text-lg font-semibold text-white"
            style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
          >
            ProductPixl
          </span>

          {/* Right: links */}
          <div className="flex items-center gap-6 text-sm text-[#9CA3AF]">
            <a
              href="mailto:hello@productpixl.com"
              className="hover:text-white transition-colors"
            >
              hello@productpixl.com
            </a>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-[#27272A]">
          <p className="text-sm text-[#6B7280]">© 2025 ProductPixl. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
