import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CopyWorkspace } from "@/components/copy/copy-workspace";
import { getBrandProfileForUser } from "@/lib/brand-profile";
import { type MarketplaceId } from "@/lib/marketplaces";

export default async function CopyPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; success?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const defaultBrandName =
    session?.user?.id ? (await getBrandProfileForUser(session.user.id)).displayName ?? "" : "";

  let linkedProduct = null;
  if (params.productId && session?.user?.id) {
    const product = await prisma.product.findFirst({
      where: { id: params.productId, userId: session.user.id },
      include: { listingCopy: true },
    });
    if (product) {
      const analysis = product.analysisJson as { brandName?: string } | null;
      const brandProfile = await getBrandProfileForUser(session.user.id);
      const bullets = (product.listingCopy?.bullets as string[] | null) ?? [];
      linkedProduct = {
        id: product.id,
        name: product.name,
        inputImageUrl: product.inputImageUrl,
        marketplace: product.marketplace as MarketplaceId,
        materials: product.materials,
        keyFeatures: product.keyFeatures,
        targetBuyer: product.targetBuyer,
        competitors: product.competitors,
        vibe: product.vibe,
        useCase: product.useCase,
        differentiators: product.differentiators,
        amazonCategory: product.amazonCategory,
        brandName: analysis?.brandName ?? brandProfile.displayName ?? "",
        listingCopy: product.listingCopy?.title
          ? {
              title: product.listingCopy.title,
              bullets,
              description: product.listingCopy.description ?? undefined,
              backendKeywords: product.listingCopy.backendKeywords ?? undefined,
            }
          : null,
      };
    }
  }

  const missingProductId = Boolean(params.productId && session?.user?.id && !linkedProduct);

  return (
    <CopyWorkspace
      initialCredits={session?.user?.credits ?? 0}
      linkedProduct={linkedProduct}
      missingProductId={missingProductId}
      defaultBrandName={defaultBrandName}
      paymentSuccess={Boolean(params.success)}
    />
  );
}
