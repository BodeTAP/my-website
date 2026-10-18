import { prisma } from "@/lib/prisma";
import NewProjectModal from "@/components/admin/NewProjectModal";
import ProjectStatusSelect from "./ProjectStatusSelect";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import EditProjectModal from "@/components/admin/EditProjectModal";
import { FadeUp } from "@/components/public/motion";
import { Briefcase, FolderKanban } from "lucide-react";
import { requireModule } from "@/lib/permissions";

export default async function ProjectsPage() {
  await requireModule("projects");
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
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <Briefcase className="w-5 h-5 text-slate-700" />
            </div>
            Manajemen Proyek
          </h1>
          <p className="text-slate-500 text-sm mt-2">{projects.length} proyek terdaftar di sistem.</p>
        </div>
        <div className="relative z-10">
          <NewProjectModal clients={clients} />
        </div>
      </FadeUp>

      <FadeUp delay={0.2} className="relative z-10">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Nama Proyek</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Klien</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Status</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase hidden md:table-cell">Deadline</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase hidden lg:table-cell">Live URL</th>
                  <th className="text-right px-6 py-3.5 text-slate-400 font-semibold text-xs tracking-wider uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 relative">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 shadow-2xs text-slate-400">
                          <FolderKanban className="w-7 h-7" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Belum ada proyek. Klik &quot;Proyek Baru&quot; untuk menambahkan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-semibold group-hover:text-slate-700 transition-colors">{p.name}</p>
                        {p.description && (
                          <p className="text-slate-400 text-xs line-clamp-1 mt-0.5 max-w-xs">{p.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-900 text-sm font-medium">{p.client.businessName}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{p.client.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <ProjectStatusSelect projectId={p.id} currentStatus={p.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium hidden md:table-cell">
                        {p.deadline
                          ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(p.deadline))
                          : "—"}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {p.liveUrl ? (
                          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 hover:underline text-xs truncate max-w-40 block font-medium transition-colors">
                            {p.liveUrl}
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
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
