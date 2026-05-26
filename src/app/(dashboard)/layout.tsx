import { AppShell } from "@/components/layout/app-shell";
import { StudioProviders } from "@/components/layout/studio-providers";
import { auth } from "@/lib/auth";
import { isBrandOnboardingComplete } from "@/lib/brand-profile";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ONBOARDING_EXEMPT_PREFIXES = ["/onboarding", "/brand", "/account"];

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
  const exempt = ONBOARDING_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!exempt && !(await isBrandOnboardingComplete(session.user.id))) {
    redirect("/onboarding");
  }

  return (
    <StudioProviders>
      <AppShell>{children}</AppShell>
    </StudioProviders>
  );
}
