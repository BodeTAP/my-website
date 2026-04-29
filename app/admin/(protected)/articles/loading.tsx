import { Skeleton, SkeletonText, SkeletonTitle, SkeletonTable } from "@/components/ui/skeleton";

export default function ArticlesLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonTitle className="w-32" />
          <SkeletonText className="w-24" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
        <div className="flex gap-1 p-1 glass rounded-xl border border-white/5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      <SkeletonTable rows={10} cols={5} />

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <SkeletonText className="w-48" />
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
