import { Skeleton, SkeletonCard, SkeletonTitle, SkeletonText } from "@/components/ui/skeleton";

export default function PortalInvoicesLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse space-y-6">
      <SkeletonTitle className="w-32 mb-8" />

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <SkeletonTitle className="w-32 h-5" />
                <SkeletonText className="w-24 h-3" />
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
              <SkeletonTitle className="w-24 h-6" />
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
