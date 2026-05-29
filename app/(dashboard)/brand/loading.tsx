import { Skeleton } from "@/components/ui/skeleton";

export default function BrandLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-2" aria-busy="true" aria-label="Loading brand profile">
      <Skeleton className="h-[420px] rounded-2xl" />
      <Skeleton className="h-[420px] rounded-2xl" />
    </div>
  );
}
