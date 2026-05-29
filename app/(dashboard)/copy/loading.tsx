import { Skeleton } from "@/components/ui/skeleton";

export default function CopyLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading copy studio">
      <Skeleton className="h-24 w-full max-w-xl" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
