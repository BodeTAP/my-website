import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function LayananLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="text-center mb-16 space-y-4">
          <SkeletonTitle className="w-1/4 mx-auto" />
          <SkeletonText className="w-1/2 mx-auto" />
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-8 border border-white/10 space-y-6">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <SkeletonTitle className="w-3/4" />
                <SkeletonText className="w-full" />
                <SkeletonText className="w-5/6" />
              </div>
              <SkeletonText className="w-24 pt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
