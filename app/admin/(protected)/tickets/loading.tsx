import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function TicketsLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonTitle className="w-32" />
          <SkeletonText className="w-24" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <SkeletonTitle className="w-1/2" />
              <div className="flex gap-3">
                <SkeletonText className="w-32" />
                <SkeletonText className="w-24" />
              </div>
            </div>
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
