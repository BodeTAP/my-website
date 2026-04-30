import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import NewProjectModal from "@/components/admin/NewProjectModal";
import ProjectStatusSelect from "./ProjectStatusSelect";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import EditProjectModal from "@/components/admin/EditProjectModal";
import { FadeUp } from "@/components/public/motion";
import { Briefcase, FolderKanban } from "lucide-react";

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      include: { client: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { businessName: "asc" },
    }),
  ]);

  return (
    <div>
      <FadeUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-600/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
              <Briefcase className="w-5 h-5 text-amber-400" />
            </div>
            Manajemen Proyek
          </h1>
          <p className="text-blue-200/60 text-sm mt-2">{projects.length} proyek terdaftar di sistem.</p>
        </div>
        <div className="relative z-10">
          <NewProjectModal clients={clients} />
        </div>
      </FadeUp>

      <FadeUp delay={0.2} className="relative z-10">
        <div className="glass rounded-3xl overflow-hidden mb-6 border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Nama Proyek</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Klien</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase hidden md:table-cell">Deadline</th>
                  <th className="text-left px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase hidden lg:table-cell">Live URL</th>
                  <th className="text-right px-6 py-4 text-blue-200/40 font-medium text-xs tracking-wider uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 relative">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                          <FolderKanban className="w-8 h-8 text-blue-200/20" />
                        </div>
                        <p className="text-blue-200/50 font-medium">Belum ada proyek. Klik "Proyek Baru" untuk menambahkan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-white font-bold group-hover:text-amber-300 transition-colors">{p.name}</p>
                        {p.description && (
                          <p className="text-blue-200/40 text-xs line-clamp-1 mt-1 max-w-xs">{p.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-blue-200/80 text-sm font-semibold">{p.client.businessName}</p>
                        <p className="text-blue-200/40 text-xs mt-0.5">{p.client.user.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <ProjectStatusSelect projectId={p.id} currentStatus={p.status} />
                      </td>
                      <td className="px-6 py-5 text-blue-200/50 text-xs font-medium hidden md:table-cell">
                        {p.deadline
                          ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(p.deadline))
                          : "—"}
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                        {p.liveUrl ? (
                          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline text-xs truncate max-w-40 block transition-colors">
                            {p.liveUrl}
                          </a>
                        ) : (
                          <span className="text-blue-200/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <EditProjectModal project={p} />
                          <DeleteProjectButton projectId={p.id} projectName={p.name} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
