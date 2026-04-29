import { Skeleton, SkeletonCard, SkeletonTitle, SkeletonText } from "@/components/ui/skeleton";

export default function PortalTicketsLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse space-y-6">
      <div className="flex items-center justify-between mb-8">
        <SkeletonTitle className="w-32" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="p-5 flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonTitle className="w-48 h-5" />
              <SkeletonText className="w-24 h-3" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
