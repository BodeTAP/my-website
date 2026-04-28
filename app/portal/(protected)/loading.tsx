// Shown instantly while any portal page fetches server-side data.
// Next.js App Router renders this inside the PortalShell layout
// so the sidebar is already visible — only the main content area pulses.
export default function PortalLoading() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Greeting */}
      <div className="mb-6 space-y-2">
        <div className="h-7 w-56 bg-white/5 rounded-xl" />
        <div className="h-4 w-32 bg-white/5 rounded-lg" />
      </div>

      {/* Project status card */}
      <div className="glass rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="h-4 w-40 bg-white/5 rounded-lg" />
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="w-9 h-9 rounded-full bg-white/5 shrink-0" />
              {i < 3 && <div className="flex-1 h-0.5 mx-2 bg-white/5" />}
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-3 sm:p-5 space-y-3">
            <div className="w-5 h-5 rounded-lg bg-white/5" />
            <div className="h-7 w-10 bg-white/5 rounded-lg" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Invoice list placeholder */}
      <div className="glass rounded-2xl p-4 sm:p-6 space-y-3">
        <div className="h-4 w-40 bg-white/5 rounded-lg mb-4" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-t border-white/5">
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-white/5 rounded" />
              <div className="h-3 w-40 bg-white/5 rounded" />
            </div>
            <div className="h-8 w-24 bg-white/5 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
