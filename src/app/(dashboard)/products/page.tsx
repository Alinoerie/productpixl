import { redirect } from "next/navigation";
import { buildProjectsQuery } from "@/components/projects/projects-filter-bar";

/** Legacy catalog URL — projects and products are the same list. */
export default async function ProductsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ brandId?: string }>;
}) {
  const params = await searchParams;
  redirect(`/projects${buildProjectsQuery({ brandId: params.brandId })}`);
}
