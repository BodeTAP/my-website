import { Skeleton, SkeletonText, SkeletonTitle, SkeletonTable } from "@/components/ui/skeleton";

export default function MaintenanceLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonTitle className="w-48" />
          <SkeletonText className="w-32" />
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/10">
        <Skeleton className="h-10 w-32 rounded-t-xl" />
        <Skeleton className="h-10 w-32 rounded-t-xl" />
      </div>

      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}
