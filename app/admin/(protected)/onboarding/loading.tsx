import { Skeleton, SkeletonText, SkeletonTitle, SkeletonCard } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="mb-8">
        <SkeletonTitle className="w-48 mb-2" />
        <SkeletonText className="w-64" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="p-5 h-24">
            <SkeletonText className="w-20 mb-3" />
            <SkeletonText className="w-12 h-6" />
          </SkeletonCard>
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <SkeletonTitle className="w-1/3 h-5" />
              <div className="flex gap-3">
                <SkeletonText className="w-32" />
                <SkeletonText className="w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
