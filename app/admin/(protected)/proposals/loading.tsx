import { Skeleton, SkeletonText, SkeletonTitle, SkeletonTable } from "@/components/ui/skeleton";

export default function ProposalsLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonTitle className="w-32" />
          <SkeletonText className="w-24" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}
