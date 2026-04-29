import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExternalLink, CheckCircle2, Loader2, Rocket, Clock } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem, ProgressBar } from "@/components/public/motion";

type ProjectStatus = "DRAFTING" | "DEVELOPMENT" | "TESTING" | "LIVE";

const STAGES: {
  status: ProjectStatus;
  label: string;
  sublabel: string;
  desc: string;
  activeColor: string;
  activeBorder: string;
  activeText: string;
}[] = [
  {
    status:      "DRAFTING",
    label:       "Perancangan & Briefing",
    sublabel:    "Tahap 1",
    desc:        "Diskusi kebutuhan, pembuatan wireframe, pemilihan desain, dan persetujuan konsep sebelum pengerjaan dimulai.",
    activeColor: "bg-blue-500/10",
    activeBorder:"border-blue-500/30",
    activeText:  "text-blue-300",
  },
  {
    status:      "DEVELOPMENT",
    label:       "Pengembangan Website",
    sublabel:    "Tahap 2",
    desc:        "Pengkodean website, implementasi fitur, integrasi konten, dan optimasi kecepatan loading.",
    activeColor: "bg-amber-500/10",
    activeBorder:"border-amber-500/30",
    activeText:  "text-amber-300",
  },
  {
    status:      "TESTING",
    label:       "Testing & Review",
    sublabel:    "Tahap 3",
    desc:        "Pengujian tampilan di semua perangkat, pengecekan performa, dan revisi berdasarkan feedback Anda.",
    activeColor: "bg-violet-500/10",
    activeBorder:"border-violet-500/30",
    activeText:  "text-violet-300",
  },
  {
    status:      "LIVE",
    label:       "Website Live 🚀",
    sublabel:    "Tahap 4",
    desc:        "Website resmi diluncurkan, domain aktif, dan diserahterimakan kepada Anda beserta akses pengelolaan.",
    activeColor: "bg-green-500/10",
    activeBorder:"border-green-500/30",
    activeText:  "text-green-300",
  },
];

const STATUS_ORDER: Record<ProjectStatus, number> = {
  DRAFTING: 0, DEVELOPMENT: 1, TESTING: 2, LIVE: 3,
};

function fmtDate(d: Date | string | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

export default async function PortalProjectsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: { include: { projects: { orderBy: { createdAt: "desc" } } } } },
  });

  if (!user?.client) redirect("/portal/dashboard");
  const projects = user.client.projects;

  return (
    <div>
      <FadeUp className="mb-8">
        <h1 className="text-2xl font-bold text-white">Proyek Saya</h1>
        <p className="text-blue-200/50 text-sm mt-1">{projects.length} proyek</p>
      </FadeUp>

      <div className="space-y-8">
        {projects.length === 0 ? (
          <FadeUp delay={0.1} className="glass rounded-2xl p-12 text-center">
            <Rocket className="w-10 h-10 text-blue-200/20 mx-auto mb-3" />
            <p className="text-blue-200/40">Belum ada proyek aktif.</p>
            <p className="text-blue-200/25 text-sm mt-1">Hubungi tim kami untuk memulai proyek Anda.</p>
          </FadeUp>
        ) : (
          <StaggerChildren className="space-y-8">
            {projects.map((project) => {
              const currentIdx = STATUS_ORDER[project.status as ProjectStatus] ?? 0;

              return (
                <StaggerItem key={project.id}>
                  <FadeUp className="glass rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-white/5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-white font-bold text-lg">{project.name}</h2>
                      {project.description && (
                        <p className="text-blue-200/50 text-sm mt-1">{project.description}</p>
                      )}
                    </div>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka Website
                      </a>
                    )}
                  </div>

                  {/* Dates row */}
                  {(project.startDate || project.deadline) && (
                    <div className="flex flex-wrap gap-5 mt-3">
                      {project.startDate && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-200/30" />
                          <span className="text-blue-200/40 text-xs">Mulai:</span>
                          <span className="text-blue-200/70 text-xs font-medium">{fmtDate(project.startDate)}</span>
                        </div>
                      )}
                      {project.deadline && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-200/30" />
                          <span className="text-blue-200/40 text-xs">Target selesai:</span>
                          <span className="text-blue-200/70 text-xs font-medium">{fmtDate(project.deadline)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Vertical timeline */}
                <div className="px-5 sm:px-6 py-5">
                  <div className="relative">
                    {STAGES.map((stage, i) => {
                      const isCompleted = currentIdx > i;
                      const isCurrent   = currentIdx === i;
                      const isLast      = i === STAGES.length - 1;

                      return (
                        <div key={stage.status} className="flex gap-4">
                          {/* Connector column */}
                          <div className="flex flex-col items-center w-9 shrink-0">
                            {/* Node */}
                            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                              isCompleted
                                ? "bg-green-500 border-green-500"
                                : isCurrent
                                ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/15"
                                : "bg-[#0a1628] border-white/10"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : isCurrent ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              ) : (
                                <span className="text-[11px] font-bold text-blue-200/20">{i + 1}</span>
                              )}
                            </div>
                            {/* Vertical line */}
                            {!isLast && (
                              <div className={`w-0.5 flex-1 my-1 min-h-8 transition-colors ${
                                isCompleted ? "bg-green-500/40" : "bg-white/5"
                              }`} />
                            )}
                          </div>

                          {/* Content card */}
                          <div className={`flex-1 mb-4 ${isLast ? "mb-0" : ""}`}>
                            <div className={`rounded-xl border p-4 transition-all duration-300 ${
                              isCurrent
                                ? `${stage.activeColor} ${stage.activeBorder}`
                                : isCompleted
                                ? "bg-green-500/5 border-green-500/15"
                                : "bg-white/2 border-white/5"
                            }`}>
                              {/* Stage meta */}
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  isCurrent
                                    ? `${stage.activeColor} ${stage.activeText} border ${stage.activeBorder}`
                                    : isCompleted
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : "bg-white/5 text-blue-200/25"
                                }`}>
                                  {stage.sublabel}
                                </span>
                                {isCurrent && (
                                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    Sedang berjalan
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="text-[11px] font-semibold text-green-400">✓ Selesai</span>
                                )}
                              </div>

                              {/* Stage name */}
                              <h3 className={`font-semibold text-sm mb-1.5 ${
                                isCurrent ? "text-white" : isCompleted ? "text-white/70" : "text-blue-200/30"
                              }`}>
                                {stage.label}
                              </h3>

                              {/* Stage description */}
                              <p className={`text-xs leading-relaxed ${
                                isCurrent ? "text-blue-200/65" : isCompleted ? "text-blue-200/35" : "text-blue-200/20"
                              }`}>
                                {stage.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes from team */}
                  {project.notes && (
                    <div className="mt-3 p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                      <p className="text-amber-400/70 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                        Catatan dari Tim
                      </p>
                      <p className="text-blue-200/60 text-xs leading-relaxed">{project.notes}</p>
                    </div>
                  )}
                </div>
                  </FadeUp>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}
