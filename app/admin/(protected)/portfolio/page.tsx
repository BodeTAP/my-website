import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Globe, ExternalLink, Star } from "lucide-react";
import PortfolioModal from "@/components/admin/PortfolioModal";
import DeletePortfolioButton from "@/components/admin/DeletePortfolioButton";

export default async function AdminPortfolioPage() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Manajemen Portofolio</h1>
          <p className="text-blue-200/50 text-sm mt-1">{portfolios.length} proyek</p>
        </div>
        <PortfolioModal mode="create" />
      </div>

      {portfolios.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Globe className="w-14 h-14 text-blue-500/20 mx-auto mb-4" />
          <p className="text-blue-200/30">Belum ada portofolio. Klik "Portofolio Baru" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {portfolios.map((p) => (
            <div key={p.id} className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors flex flex-col">
              {/* Cover */}
              <div className="relative h-44 bg-linear-to-br from-blue-900/40 to-indigo-900/20 shrink-0">
                {p.coverImage ? (
                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Globe className="w-12 h-12 text-blue-500/20" />
                  </div>
                )}
                {p.featured && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500/90 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3" /> Featured
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 text-blue-200/60 text-xs px-2 py-0.5 rounded-full">
                  #{p.order}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-white font-semibold text-sm leading-snug">{p.title}</h2>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400/60 hover:text-blue-300 transition-colors p-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <PortfolioModal mode="edit" portfolio={p} />
                    <DeletePortfolioButton id={p.id} title={p.title} />
                  </div>
                </div>

                {p.clientName && (
                  <p className="text-blue-400/50 text-xs mb-2">{p.clientName}</p>
                )}

                {p.description && (
                  <p className="text-blue-200/40 text-xs line-clamp-2 mb-3 flex-1">{p.description}</p>
                )}

                {/* Tech stack */}
                {p.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.techStack.map((t) => (
                      <Badge key={t} variant="outline"
                        className="text-blue-300 border-blue-500/20 bg-blue-500/5 text-xs py-0">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                {p.metrics && (
                  <p className="text-green-400/80 text-xs font-medium bg-green-500/10 rounded-lg px-2.5 py-1.5">
                    {p.metrics}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
