import { Skeleton, SkeletonCard, SkeletonTitle, SkeletonText, SkeletonAvatar } from "@/components/ui/skeleton";

export default function PortalProfileLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse max-w-2xl mx-auto space-y-8">
      <SkeletonTitle className="w-32 mb-8" />

      <SkeletonCard className="p-8 space-y-8">
        <div className="flex flex-col items-center gap-4 border-b border-white/5 pb-8">
          <SkeletonAvatar size="lg" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonText className="w-24 h-4" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
          <div className="pt-4">
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </SkeletonCard>
    </div>
  );
}
