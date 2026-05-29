import { auth } from "@/lib/auth";
import { ListingBuilderWorkspace } from "@/components/batch/listing-builder-workspace";

export default async function ListingBuilderPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return <ListingBuilderWorkspace />;
}
