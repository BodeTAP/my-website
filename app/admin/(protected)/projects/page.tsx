import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import NewProjectModal from "@/components/admin/NewProjectModal";
import ProjectStatusSelect from "./ProjectStatusSelect";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

const STATUS_LABEL: Record<string, string> = {
  DRAFTING: "Drafting",
  DEVELOPMENT: "Development",
  TESTING: "Testing",
  LIVE: "Live",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFTING: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  DEVELOPMENT: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  TESTING: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  LIVE: "bg-green-500/15 text-green-300 border-green-500/20",
};

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
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Manajemen Proyek</h1>
          <p className="text-blue-200/50 text-sm mt-1">{projects.length} proyek</p>
        </div>
        <NewProjectModal clients={clients} />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">Proyek</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">Klien</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs">Status</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs hidden md:table-cell">Deadline</th>
                <th className="text-left px-4 sm:px-5 py-3 text-blue-200/40 font-medium text-xs hidden lg:table-cell">Live URL</th>
                <th className="px-4 sm:px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-blue-200/30">
                    Belum ada proyek. Klik "Proyek Baru" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 sm:px-5 py-4">
                      <p className="text-white font-medium">{p.name}</p>
                      {p.description && (
                        <p className="text-blue-200/40 text-xs line-clamp-1 mt-0.5">{p.description}</p>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <p className="text-blue-200/70 text-sm">{p.client.businessName}</p>
                      <p className="text-blue-200/40 text-xs">{p.client.user.email}</p>
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <ProjectStatusSelect projectId={p.id} currentStatus={p.status} />
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-blue-200/50 text-xs hidden md:table-cell">
                      {p.deadline
                        ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(p.deadline))
                        : "—"}
                    </td>
                    <td className="px-4 sm:px-5 py-4 hidden lg:table-cell">
                      {p.liveUrl ? (
                        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs truncate max-w-40 block">
                          {p.liveUrl}
                        </a>
                      ) : (
                        <span className="text-blue-200/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <DeleteProjectButton projectId={p.id} projectName={p.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
