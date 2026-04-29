import { Skeleton, SkeletonText, SkeletonTitle } from "@/components/ui/skeleton";

export default function BayarLoading() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {/* Invoice Header */}
          <div className="p-8 border-b border-white/5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <SkeletonTitle className="w-48" />
                <SkeletonText className="w-32" />
              </div>
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <SkeletonText className="w-16" />
                <SkeletonText className="w-32" />
              </div>
              <div className="space-y-2">
                <SkeletonText className="w-16" />
                <SkeletonText className="w-32" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-8 space-y-6">
            <SkeletonTitle className="w-32 h-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <SkeletonText className="w-1/2" />
                  <SkeletonText className="w-24" />
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
              <SkeletonTitle className="w-24" />
              <SkeletonTitle className="w-40 h-8" />
            </div>
          </div>

          {/* Payment Area */}
          <div className="p-8 bg-white/5 space-y-6">
            <div className="space-y-2 text-center">
              <SkeletonTitle className="w-1/3 mx-auto h-6" />
              <SkeletonText className="w-2/3 mx-auto" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl border border-white/5" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
