import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20 animate-pulse">
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-10">
          <Skeleton className="h-6 w-32 mx-auto rounded-full" />
          <SkeletonTitle className="h-16 w-3/4 mx-auto" />
          <SkeletonText className="w-1/2 mx-auto" />
          <div className="flex justify-center gap-4 pt-4">
            <Skeleton className="h-12 w-40 rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl border border-white/5" />
          </div>
        </div>

        {/* Domain Checker */}
        <div className="max-w-2xl mx-auto glass p-6 rounded-2xl border border-white/10 space-y-4">
          <SkeletonText className="w-48 mx-auto" />
          <div className="flex gap-2">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-24 rounded-xl" />
          </div>
        </div>

        {/* Pricing/Services Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-8 border border-white/10 space-y-6">
              <SkeletonTitle className="w-1/2" />
              <SkeletonTitle className="w-2/3 h-10" />
              <div className="space-y-3 pt-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <SkeletonText key={j} className="w-full" />
                ))}
              </div>
              <Skeleton className="h-12 w-full rounded-xl mt-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
