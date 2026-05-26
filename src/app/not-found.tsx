import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hero-glow px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">404</p>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-[var(--muted-fg)]">
        That route doesn&apos;t exist. Head back to the studio or landing page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Open studio</Link>
        </Button>
      </div>
    </div>
  );
}
