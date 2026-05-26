import { AppShell } from "@/components/layout/app-shell";
import { StudioProviders } from "@/components/layout/studio-providers";
import { auth } from "@/lib/auth";
import { isBrandOnboardingComplete } from "@/lib/brand-profile";
import {
  isCreditExemptPath,
  isCreditLockedPath,
  hasPaidCredits,
  pricingPaywallUrl,
} from "@/lib/credits-access";
import { getUserCredits } from "@/lib/require-credits";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ONBOARDING_EXEMPT_PREFIXES = ["/onboarding", "/brand", "/account", "/pricing"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    const pathname = (await headers()).get("x-pathname") || "/dashboard";
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  const pathname = (await headers()).get("x-pathname") || "/dashboard";
  const onboardingExempt = ONBOARDING_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!onboardingExempt && !(await isBrandOnboardingComplete(session.user.id))) {
    redirect("/onboarding");
  }

  const credits = await getUserCredits(session.user.id);
  if (
    !isCreditExemptPath(pathname) &&
    isCreditLockedPath(pathname) &&
    !hasPaidCredits(credits)
  ) {
    redirect(pricingPaywallUrl("locked"));
  }

  return (
    <StudioProviders>
      <AppShell credits={credits}>{children}</AppShell>
    </StudioProviders>
  );
}
