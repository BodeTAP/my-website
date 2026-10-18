import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-slate-200/80 rounded-xl", className)} />
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 bg-slate-200/80 rounded-full", className)} />
  );
}

export function SkeletonTitle({ className }: { className?: string }) {
  return (
    <div className={cn("h-7 bg-slate-200/80 rounded-full", className)} />
  );
}

export function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("bg-white rounded-2xl p-5 border border-slate-200 shadow-xs", className)}>
      <div className="animate-pulse space-y-4">
        {children}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
      <div className="animate-pulse">
        <div className="border-b border-slate-100 px-5 py-3.5 flex gap-4 bg-slate-50">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 bg-slate-200 rounded-full flex-1" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex gap-4">
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className="h-4 bg-slate-200/70 rounded-full flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };
  return (
    <div className={cn("rounded-full bg-slate-200/80 animate-pulse", sizes[size], className)} />
  );
}
