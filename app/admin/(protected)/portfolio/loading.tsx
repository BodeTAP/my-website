import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function PortfolioAdminLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonTitle className="w-32" />
          <SkeletonText className="w-24" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl overflow-hidden border border-white/10 space-y-4 pb-4">
            <Skeleton className="h-44 rounded-none" />
            <div className="px-5 space-y-3">
              <SkeletonTitle className="w-3/4" />
              <div className="space-y-2">
                <SkeletonText className="w-full" />
                <SkeletonText className="w-2/3" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
