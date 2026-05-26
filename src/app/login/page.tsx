import Link from "next/link";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";

function safeCallbackUrl(raw?: string) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  const errorMessage =
    params.error === "OAuthAccountNotLinked"
      ? "That Google account is already linked to another sign-in method."
      : params.error
        ? "Sign-in failed. Please try again."
        : null;

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-[var(--ink)] p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
            Px
          </span>
          <span className="font-serif text-xl">ProductPixl</span>
        </Link>
        <div>
          <h2 className="font-serif text-4xl leading-tight">
            One photo.
            <br />
            <span className="text-orange-300">Full listing studio.</span>
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            {[
              "10 free credits — no credit card",
              "Pay per generation, not per month",
              "Amazon gallery + listing copy",
              "Photo in — no ASIN required",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-orange-300" />
                {item}
              </li>
            ))}
          </ul>
          <ShowcaseMosaic className="mt-10 max-w-sm opacity-95" />
        </div>
        <p className="text-xs text-white/40">Built for Amazon & EU marketplace sellers</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-lg)] md:p-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ink)] text-xs font-bold text-white">
              Px
            </span>
            <span className="font-serif text-xl">ProductPixl</span>
          </Link>
          <h1 className="font-serif text-3xl">Sign in</h1>
          <p className="mt-2 text-[var(--muted-fg)]">
            Continue with Google to access your studio and credits.
          </p>

          {errorMessage ? (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </p>
          ) : null}

          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              className="h-12 w-full rounded-xl border-[var(--border-strong)] bg-white text-base hover:bg-[var(--muted)]/40"
              size="lg"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-[var(--muted-fg)]">
            New accounts receive 10 free generation credits.
          </p>
        </div>
        <div className="mt-10 w-full max-w-md lg:hidden">
          <ShowcaseMosaic className="opacity-90" />
        </div>
      </div>
    </div>
  );
}
