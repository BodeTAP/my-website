import { Skeleton, SkeletonText, SkeletonTitle, SkeletonAvatar } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        {/* Hero Area */}
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-24">
          <div className="flex-1 space-y-6">
            <SkeletonTitle className="w-3/4 h-12" />
            <div className="space-y-3">
              <SkeletonText className="w-full" />
              <SkeletonText className="w-full" />
              <SkeletonText className="w-5/6" />
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
          </div>
          <div className="flex-1 w-full lg:w-1/2">
            <Skeleton className="h-80 rounded-2xl w-full" />
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16 space-y-4">
          <SkeletonTitle className="w-1/4 mx-auto" />
          <SkeletonText className="w-1/3 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-8 border border-white/10 text-center space-y-4">
              <SkeletonAvatar size="lg" className="mx-auto" />
              <div className="space-y-2">
                <SkeletonTitle className="w-1/2 mx-auto" />
                <SkeletonText className="w-1/3 mx-auto" />
              </div>
              <SkeletonText className="w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
