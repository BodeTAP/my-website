import { Skeleton, SkeletonCard, SkeletonTitle, SkeletonText, SkeletonAvatar } from "@/components/ui/skeleton";

export default function PortalDashboardLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse space-y-8">
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="space-y-2">
          <SkeletonTitle className="w-48" />
          <SkeletonText className="w-32" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="p-5 h-28">
            <SkeletonText className="w-24 mb-3" />
            <SkeletonText className="w-16 h-7" />
          </SkeletonCard>
        ))}
      </div>

      {/* Project Progress */}
      <div className="space-y-4">
        <SkeletonTitle className="w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <SkeletonTitle className="w-1/2" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <SkeletonText className="w-12" />
                  <SkeletonText className="w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  );
}
