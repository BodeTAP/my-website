import { Skeleton, SkeletonCard, SkeletonTitle, SkeletonText } from "@/components/ui/skeleton";

export default function PortalProjectsLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse space-y-6">
      <SkeletonTitle className="w-32 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={i} className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <SkeletonTitle className="w-48" />
                <SkeletonText className="w-64" />
              </div>
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <SkeletonText className="w-24" />
                  <SkeletonText className="w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              
              <div className="flex justify-between border-t border-white/5 pt-4">
                <div className="space-y-1">
                  <SkeletonText className="w-16" />
                  <SkeletonText className="w-24" />
                </div>
                <div className="space-y-1 text-right">
                  <SkeletonText className="w-16 ml-auto" />
                  <SkeletonText className="w-24 ml-auto" />
                </div>
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
