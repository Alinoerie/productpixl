import { auth } from "@/lib/auth";
import { getUserCredits } from "@/lib/require-credits";
import { hasPaidCredits } from "@/lib/credits-access";
import { listBrandsForUser, getActiveBrandId } from "@/lib/brands";
import { StudioShell } from "@/components/studio/studio-shell";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;
  const credits = userId ? await getUserCredits(userId) : 0;
  const studioLocked = !hasPaidCredits(credits);
  const brands = userId ? await listBrandsForUser(userId) : [];
  const activeBrandId = userId ? await getActiveBrandId(userId) : "";

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 md:space-y-8">
      <StudioShell
        studioLocked={studioLocked}
        initialCredits={credits}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        activeBrandId={activeBrandId ?? brands[0]?.id ?? ""}
      >
        {children}
      </StudioShell>
    </div>
  );
}
