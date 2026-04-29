import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function PortfolioLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="mb-12 text-center space-y-4">
          <SkeletonTitle className="w-1/3 mx-auto" />
          <SkeletonText className="w-1/2 mx-auto" />
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden border border-white/10 h-full flex flex-col">
              <Skeleton className="h-56 rounded-none" />
              <div className="p-6 space-y-4 flex-1">
                <SkeletonTitle className="w-3/4" />
                <div className="space-y-2">
                  <SkeletonText className="w-full" />
                  <SkeletonText className="w-5/6" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
