import { AppShell } from "@/components/layout/app-shell";
import { StudioProviders } from "@/components/layout/studio-providers";
import { auth } from "@/lib/auth";
import { isActiveBrandOnboardingComplete } from "@/lib/brands";
import { getUserCredits } from "@/lib/require-credits";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ONBOARDING_EXEMPT_PREFIXES = [
  "/onboarding",
  "/brand",
  "/brands",
  "/account",
  "/pricing",
  "/playbooks",
  "/templates",
  "/my-playbooks",
  "/batch",
  "/products",
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    const pathname = (await headers()).get("x-pathname") || "/studio";
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  const pathname = (await headers()).get("x-pathname") || "/studio";
  const onboardingExempt = ONBOARDING_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!onboardingExempt && !(await isActiveBrandOnboardingComplete(session.user.id))) {
    redirect("/onboarding");
  }

  const credits = await getUserCredits(session.user.id);

  return (
    <StudioProviders>
      <AppShell credits={credits}>{children}</AppShell>
    </StudioProviders>
  );
}
