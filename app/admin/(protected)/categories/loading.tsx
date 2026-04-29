import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse max-w-2xl">
      <div className="mb-8">
        <SkeletonTitle className="w-32 mb-2" />
        <SkeletonText className="w-48" />
      </div>

      <div className="glass rounded-2xl p-6 border border-white/10 space-y-4 mb-8">
        <SkeletonTitle className="w-40 h-6" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 border border-white/10 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <SkeletonTitle className="w-1/3 h-5" />
              <SkeletonText className="w-24 h-3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
