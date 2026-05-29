import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { auth, signIn } from "@/lib/auth";
import { isEmailAuthConfigured } from "@/lib/email/magic-link";
import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";
import { EmailSignInForm } from "@/components/auth/email-sign-in-form";
import { ShowcaseMosaic } from "@/components/marketing/showcase-mosaic";
import { ProductPixlWordmark } from "@/components/brand/productpixl-logo";
import { loginDestinationLabel } from "@/lib/login-destination";
import { USP_PILLARS, USP_SUBHEAD, USP_TAGLINE } from "@/lib/marketing-usp";

function safeCallbackUrl(raw?: string) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/studio";
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
  const emailEnabled = isEmailAuthConfigured();

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  const errorMessage =
    params.error === "OAuthAccountNotLinked"
      ? "That email is already linked to another sign-in method. Use the same method you signed up with."
      : params.error === "Verification"
        ? "That sign-in link expired or was already used. Request a new one below."
        : params.error
          ? "Sign-in failed. Please try again."
          : null;

  const destinationLabel = loginDestinationLabel(callbackUrl);
  const showDestinationHint = callbackUrl !== "/studio" && callbackUrl !== "/dashboard";

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  async function signInWithEmail(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email) return;
    await signIn("email", { email, redirectTo: callbackUrl });
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-[var(--ink)] p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <ProductPixlWordmark size={48} textClassName="text-white" priority />
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-soft)]">{USP_TAGLINE}</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight">
            One photo.
            <br />
            <span className="text-[var(--accent-soft)]">Full listing studio.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-white/70">{USP_SUBHEAD}</p>
          <ul className="mt-6 space-y-3 text-sm text-white/75">
            {USP_PILLARS.slice(0, 4).map((pillar) => (
              <li key={pillar.id} className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--accent-soft)]" />
                {pillar.title}
              </li>
            ))}
          </ul>
          <Link
            href="/guides/ecommerce"
            className="mt-6 inline-flex text-sm font-medium text-[var(--accent-soft)] underline-offset-2 hover:underline"
          >
            Free: 10-playbook ecommerce guide pack →
          </Link>
          <ShowcaseMosaic className="mt-10 max-w-sm opacity-95" />
        </div>
        <p className="text-xs text-white/40">{USP_TAGLINE} · Amazon & EU marketplaces</p>
      </div>

      <main id="main" className="flex flex-1 flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-lg)] md:p-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <ProductPixlWordmark size={44} priority />
          </Link>
          <h1 className="font-serif text-3xl">Sign in</h1>
          <p className="mt-2 text-[var(--muted-fg)]">
            {emailEnabled
              ? "Continue with Google or get a one-click email link — no password."
              : "Continue with Google to access your studio and credits."}
          </p>

          {showDestinationHint ? (
            <p className="mt-4 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-soft)]/40 px-4 py-3 text-sm">
              After sign-in you&apos;ll return to <strong>{destinationLabel}</strong>.
            </p>
          ) : null}

          {errorMessage ? (
            <p
              id="login-error"
              role="alert"
              className="mt-6 rounded-xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--error)]"
            >
              {errorMessage}
            </p>
          ) : null}

          <GoogleSignInForm
            errorDescribedBy={errorMessage ? "login-error" : undefined}
            action={signInWithGoogle}
          />

          {emailEnabled ? (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[var(--border)]" />
                </div>
                <p className="relative mx-auto w-fit bg-[var(--card)] px-3 text-xs uppercase tracking-wide text-[var(--muted-fg)]">
                  Or email
                </p>
              </div>
              <EmailSignInForm action={signInWithEmail} />
            </>
          ) : null}

          <p className="mt-6 text-center text-xs text-[var(--muted-fg)]">
            New accounts receive 10 free generation credits. By signing in you agree to our{" "}
            <Link href="/terms" className="underline-offset-2 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="mt-4 text-center text-sm">
            Not ready to sign in?{" "}
            <Link href="/grader" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Grade your listing free →
            </Link>
            {" · "}
            <Link href="/guides/ecommerce" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Get the free guide pack →
            </Link>
            {" · "}
            <Link href="/demo" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Book a demo →
            </Link>
          </p>
        </div>
        <div className="mt-10 w-full max-w-md lg:hidden">
          <ShowcaseMosaic className="opacity-90" />
        </div>
      </main>
    </div>
  );
}
