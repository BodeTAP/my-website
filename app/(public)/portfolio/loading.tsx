export default function PortfolioLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="h-4 w-36 bg-white/5 rounded mb-6" />

        {/* Heading */}
        <div className="text-center mb-14 space-y-3">
          <div className="h-10 w-64 bg-white/5 rounded-xl mx-auto" />
          <div className="h-4 w-96 bg-white/5 rounded mx-auto" />
        </div>

        {/* Portfolio grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <div className="h-52 bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-white/5 rounded" />
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-5/6 bg-white/5 rounded" />
                <div className="flex gap-2 pt-1">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-6 w-16 bg-white/5 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
