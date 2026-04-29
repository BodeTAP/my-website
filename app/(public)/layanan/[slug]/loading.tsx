import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function LayananDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        {/* Hero Area */}
        <div className="text-center mb-16 space-y-6">
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
          <SkeletonTitle className="w-2/3 h-12 mx-auto" />
          <SkeletonText className="w-3/4 mx-auto" />
        </div>

        {/* Content Blocks */}
        <div className="space-y-12 mb-16">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <SkeletonTitle className="w-1/3" />
              <div className="space-y-2">
                <SkeletonText className="w-full" />
                <SkeletonText className="w-full" />
                <SkeletonText className="w-2/3" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="glass rounded-2xl p-10 border border-white/10 text-center space-y-6">
          <SkeletonTitle className="w-1/2 mx-auto" />
          <SkeletonText className="w-2/3 mx-auto" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-44 rounded-xl" />
            <Skeleton className="h-12 w-44 rounded-xl border border-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
