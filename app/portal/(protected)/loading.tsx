import { Skeleton, SkeletonCard, SkeletonTitle, SkeletonText, SkeletonAvatar } from "@/components/ui/skeleton";

export default function PortalDashboardLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <SkeletonAvatar size="lg" />
        <div className="space-y-2">
          <SkeletonTitle className="w-48" />
          <SkeletonText className="w-32" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="p-5 h-28">
            <SkeletonText className="w-24 mb-3" />
            <SkeletonText className="w-16 h-7" />
          </SkeletonCard>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <SkeletonTitle className="w-32" />
        <SkeletonCard className="p-0 overflow-hidden">
          <div className="divide-y divide-white/5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1">
                    <SkeletonText className="w-48" />
                    <SkeletonText className="w-24" />
                  </div>
                </div>
                <Skeleton className="w-12 h-5 rounded-full" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
