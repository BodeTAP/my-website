import { Skeleton, SkeletonCard, SkeletonTitle, SkeletonText } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="mb-8 space-y-2">
        <SkeletonTitle className="w-48" />
        <SkeletonText className="w-64" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="p-4 sm:p-5 h-32">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <SkeletonText className="w-12 h-6" />
            <SkeletonText className="w-24" />
          </SkeletonCard>
        ))}
      </div>

      {/* Revenue Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="p-4 sm:p-5 h-28">
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <SkeletonText className="w-24 mt-2" />
            </div>
            <SkeletonText className="w-20 h-6 mt-2" />
          </SkeletonCard>
        ))}
      </div>

      {/* Leads & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <SkeletonCard className="lg:col-span-3 p-4 sm:p-6 h-[400px]">
          <div className="flex justify-between mb-4">
            <SkeletonTitle className="w-32" />
            <SkeletonText className="w-20" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-white/5">
                <div className="space-y-2">
                  <SkeletonText className="w-32" />
                  <SkeletonText className="w-48" />
                </div>
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard className="lg:col-span-2 p-4 sm:p-6 h-[400px]">
          <SkeletonTitle className="w-32 mb-6" />
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <SkeletonText className="w-16" />
                  <SkeletonText className="w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
