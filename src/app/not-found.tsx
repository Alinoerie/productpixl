import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center bg-hero-glow px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">404</p>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-[var(--muted-fg)]">
        {signedIn
          ? "That route doesn't exist in your studio. Head back to the dashboard or landing page."
          : "That route doesn't exist. Sign in to open your studio, or return home."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </Button>
        {signedIn ? (
          <>
            <Button asChild variant="outline">
              <Link href="/generate">Image studio</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/projects">All projects</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Open studio</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="outline">
              <Link href="/grader">Free grader</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
