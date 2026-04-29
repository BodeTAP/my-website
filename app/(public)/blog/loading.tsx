import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="mb-10 text-center space-y-4">
          <SkeletonTitle className="w-1/3 mx-auto" />
          <SkeletonText className="w-1/2 mx-auto" />
          <Skeleton className="h-12 w-full max-w-md mx-auto rounded-2xl" />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden border border-white/10 h-full flex flex-col">
              <Skeleton className="h-48 rounded-none" />
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <SkeletonText className="w-24" />
                </div>
                <SkeletonTitle className="w-full" />
                <div className="space-y-2 flex-1">
                  <SkeletonText className="w-full" />
                  <SkeletonText className="w-full" />
                  <SkeletonText className="w-2/3" />
                </div>
                <div className="flex flex-wrap gap-1">
                  <SkeletonText className="w-10" />
                  <SkeletonText className="w-12" />
                </div>
                <SkeletonText className="w-28 mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
