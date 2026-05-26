import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CopyWorkspace } from "@/components/copy/copy-workspace";
import { isBrandProfileConfigured } from "@/lib/brand-profile";
import { type MarketplaceId } from "@/lib/marketplaces";

export default async function CopyPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const brandConfigured = session?.user?.id
    ? await isBrandProfileConfigured(session.user.id)
    : true;

  let linkedProduct = null;
  if (params.productId && session?.user?.id) {
    const product = await prisma.product.findFirst({
      where: { id: params.productId, userId: session.user.id },
      include: { listingCopy: true },
    });
    if (product) {
      const bullets = (product.listingCopy?.bullets as string[] | null) ?? [];
      linkedProduct = {
        id: product.id,
        name: product.name,
        inputImageUrl: product.inputImageUrl,
        marketplace: product.marketplace as MarketplaceId,
        materials: product.materials,
        keyFeatures: product.keyFeatures,
        targetBuyer: product.targetBuyer,
        amazonCategory: product.amazonCategory,
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
      brandConfigured={brandConfigured}
    />
  );
}
