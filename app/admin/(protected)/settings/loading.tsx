import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse max-w-4xl">
      <div className="mb-8">
        <SkeletonTitle className="w-32 mb-2" />
        <SkeletonText className="w-64" />
      </div>

      <div className="glass rounded-2xl p-8 border border-white/10 space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <SkeletonText className="w-32 h-4" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <SkeletonText className="w-2/3 h-3" />
          </div>
        ))}
        <div className="pt-4">
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
