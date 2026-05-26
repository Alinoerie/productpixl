import { ContentStudioSubnav } from "@/components/layout/content-studio-subnav";
import { auth } from "@/lib/auth";
import { getUserCredits } from "@/lib/require-credits";
import { hasPaidCredits } from "@/lib/credits-access";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const credits = session?.user?.id ? await getUserCredits(session.user.id) : 0;
  const studioLocked = !hasPaidCredits(credits);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <ContentStudioSubnav studioLocked={studioLocked} />
      {children}
    </div>
  );
}
