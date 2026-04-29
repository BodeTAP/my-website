import { Skeleton, SkeletonText, SkeletonTitle, SkeletonAvatar } from "@/components/ui/skeleton";

export default function TicketDetailLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse max-w-3xl space-y-8">
      {/* Header Card */}
      <div className="glass rounded-2xl p-6 border border-white/10 flex justify-between items-start">
        <div className="space-y-2">
          <SkeletonTitle className="w-64 h-8" />
          <SkeletonText className="w-48" />
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>

      {/* Message Thread */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
            <SkeletonAvatar size="md" className="shrink-0" />
            <div className={`space-y-2 max-w-[80%] ${i % 2 === 0 ? "" : "items-end"}`}>
              <div className="glass p-4 rounded-2xl border border-white/10 space-y-2">
                <SkeletonText className="w-full" />
                <SkeletonText className="w-full" />
                <SkeletonText className="w-2/3" />
              </div>
              <SkeletonText className="w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
        <SkeletonText className="w-full h-24 rounded-xl" />
        <div className="flex justify-end gap-2">
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
