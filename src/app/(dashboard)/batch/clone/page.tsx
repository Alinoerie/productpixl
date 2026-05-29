import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CloneCatalogWorkspace } from "@/components/batch/clone-catalog-workspace";
import { primaryListingCopy } from "@/lib/listing-copy";

export default async function CloneCatalogPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      listingCopies: true,
      assets: { where: { imageUrl: { not: null } }, take: 1 },
    },
  });

  const sourceProducts = products.map((p) => {
    const copy = primaryListingCopy(p.listingCopies, p.marketplace);
    return {
      id: p.id,
      name: p.name,
      marketplace: p.marketplace,
      hasCopy: Boolean(copy?.title),
      hasImages: p.assets.length > 0,
    };
  });

  return <CloneCatalogWorkspace products={sourceProducts} />;
}
