export default function ArticleLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-4 bg-white/5 rounded" />
          <div className="h-3 w-3 bg-white/5 rounded" />
          <div className="h-4 w-16 bg-white/5 rounded" />
          <div className="h-3 w-3 bg-white/5 rounded" />
          <div className="h-4 w-48 bg-white/5 rounded" />
        </div>

        {/* Cover image */}
        <div className="rounded-2xl h-64 sm:h-80 bg-white/5 mb-8" />

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-20 bg-white/5 rounded-full" />
          <div className="h-4 w-32 bg-white/5 rounded" />
          <div className="h-4 w-24 bg-white/5 rounded" />
        </div>

        {/* Title */}
        <div className="space-y-3 mb-6">
          <div className="h-9 w-full bg-white/5 rounded-xl" />
          <div className="h-9 w-4/5 bg-white/5 rounded-xl" />
        </div>

        {/* Excerpt */}
        <div className="border-l-2 border-white/5 pl-4 space-y-2 mb-10">
          <div className="h-5 w-full bg-white/5 rounded" />
          <div className="h-5 w-5/6 bg-white/5 rounded" />
        </div>

        {/* Content paragraphs */}
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
