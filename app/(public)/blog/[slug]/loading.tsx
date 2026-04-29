import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        {/* Breadcrumb */}
        <SkeletonText className="w-32 mb-8" />

        {/* Header */}
        <div className="space-y-4 mb-8">
          <SkeletonTitle className="w-3/4 h-10" />
          <div className="flex gap-4">
            <SkeletonText className="w-24" />
            <SkeletonText className="w-32" />
          </div>
        </div>

        {/* Cover image */}
        <Skeleton className="h-64 sm:h-96 rounded-2xl mb-12" />

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <SkeletonText className="w-full" />
            <SkeletonText className="w-full" />
            <SkeletonText className="w-full" />
            <SkeletonText className="w-2/3" />
          </div>
          
          <SkeletonTitle className="w-1/2" />
          
          <div className="space-y-2">
            <SkeletonText className="w-full" />
            <SkeletonText className="w-full" />
            <SkeletonText className="w-3/4" />
          </div>

          <div className="glass rounded-2xl p-8 border border-white/10 space-y-4">
            <SkeletonTitle className="w-1/3" />
            <SkeletonText className="w-full" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
