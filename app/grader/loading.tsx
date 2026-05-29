import { Skeleton } from "@/components/ui/skeleton";

export default function GraderLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading listing grader">
      <Skeleton className="h-24 w-full max-w-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
