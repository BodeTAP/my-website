import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonTitle className="w-32" />
          <SkeletonText className="w-24" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex justify-between items-start">
              <SkeletonTitle className="w-1/2" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonText className="w-full" />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs">
                <SkeletonText className="w-12" />
                <SkeletonText className="w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
            <div className="flex justify-between items-center pt-4">
              <SkeletonText className="w-24" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
