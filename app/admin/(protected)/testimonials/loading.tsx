import { Skeleton, SkeletonText, SkeletonTitle, SkeletonAvatar } from "@/components/ui/skeleton";

export default function TestimonialsLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonTitle className="w-40" />
          <SkeletonText className="w-32" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 border border-white/10 flex gap-6 items-start">
            <SkeletonAvatar size="md" className="shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <SkeletonTitle className="w-40 h-5" />
                  <SkeletonText className="w-32 h-3" />
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="w-3 h-3 rounded-full" />
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <SkeletonText className="w-full" />
                <SkeletonText className="w-full" />
                <SkeletonText className="w-3/4" />
              </div>
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="w-16 h-5 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
