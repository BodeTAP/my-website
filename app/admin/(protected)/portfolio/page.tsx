import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Globe, ExternalLink, Star } from "lucide-react";
import PortfolioModal from "@/components/admin/PortfolioModal";
import DeletePortfolioButton from "@/components/admin/DeletePortfolioButton";
import { requireModule } from "@/lib/permissions";

export default async function AdminPortfolioPage() {
  await requireModule("portfolio");
  const portfolios = await prisma.portfolio.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Portofolio</h1>
          <p className="text-slate-500 text-sm mt-1">{portfolios.length} proyek tersimpan</p>
        </div>
        <PortfolioModal mode="create" />
      </div>

      {portfolios.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-2xs">
          <Globe className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Belum ada portofolio. Klik &quot;Portofolio Baru&quot; untuk menambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {portfolios.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col">
              {/* Cover */}
              <div className="relative h-44 bg-slate-100 shrink-0">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Globe className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                {p.featured && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                    <Star className="w-3 h-3 fill-white" /> Featured
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-xs text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                  #{p.order}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-slate-900 font-semibold text-sm leading-snug">{p.title}</h2>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <PortfolioModal mode="edit" portfolio={p} />
                    <DeletePortfolioButton id={p.id} title={p.title} />
                  </div>
                </div>

                {p.clientName && (
                  <p className="text-slate-500 text-xs mb-2 font-medium">{p.clientName}</p>
                )}

                {p.description && (
                  <p className="text-slate-600 text-xs line-clamp-2 mb-3 flex-1">{p.description}</p>
                )}

                {/* Tech stack */}
                {p.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.techStack.map((t) => (
                      <Badge key={t} variant="outline"
                        className="text-slate-700 border-slate-200 bg-slate-50 text-xs py-0.5 px-2 rounded-md font-medium">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                {p.metrics && (
                  <p className="text-emerald-700 text-xs font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
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
