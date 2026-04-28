// Shown inside AdminShell (sidebar already visible) while any admin page loads.
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-white/5 rounded-xl" />
          <div className="h-4 w-28 bg-white/5 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-white/5 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-white/5" />
            <div className="h-8 w-12 bg-white/5 rounded-lg" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Table / content area */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4 flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-7 w-20 bg-white/5 rounded-lg" />
          ))}
        </div>
        <div className="divide-y divide-white/5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 bg-white/5 rounded" />
                <div className="h-3 w-56 bg-white/5 rounded" />
              </div>
              <div className="h-4 w-20 bg-white/5 rounded" />
              <div className="h-6 w-16 bg-white/5 rounded-full" />
              <div className="h-8 w-20 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
