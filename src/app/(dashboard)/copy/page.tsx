import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CopyWorkspace } from "@/components/copy/copy-workspace";
import { type MarketplaceId } from "@/lib/marketplaces";

export default async function CopyPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  let linkedProduct = null;
  if (params.productId && session?.user?.id) {
    const product = await prisma.product.findFirst({
      where: { id: params.productId, userId: session.user.id },
      include: { listingCopy: true },
    });
    if (product) {
      linkedProduct = {
        id: product.id,
        name: product.name,
        inputImageUrl: product.inputImageUrl,
        marketplace: product.marketplace as MarketplaceId,
        materials: product.materials,
        keyFeatures: product.keyFeatures,
        targetBuyer: product.targetBuyer,
        amazonCategory: product.amazonCategory,
      };
    }
  }

  return (
    <CopyWorkspace
      initialCredits={session?.user?.credits ?? 0}
      linkedProduct={linkedProduct}
    />
  );
}
