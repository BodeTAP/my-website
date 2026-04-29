import { Skeleton, SkeletonText, SkeletonTitle, SkeletonTable } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonTitle className="w-32" />
          <SkeletonText className="w-24" />
        </div>
      </div>

      <SkeletonTable rows={8} cols={4} />
    </div>
  );
}
