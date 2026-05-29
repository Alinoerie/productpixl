import { Skeleton } from "@/components/ui/skeleton";

export default function GenerateLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading image studio">
      <Skeleton className="h-24 w-full max-w-xl" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
