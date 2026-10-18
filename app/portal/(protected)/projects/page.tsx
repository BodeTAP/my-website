import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExternalLink, CheckCircle2, Loader2, Rocket, Clock, MessageSquare } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/public/motion";

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
    label:       "Website Live",
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
    <div className="space-y-6">
      <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Proyek Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau milestone pengerjaan, target rilis, dan ruang kerja website Anda.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs w-fit">
          {projects.length} Proyek Terdaftar
        </div>
      </FadeUp>

      <div className="space-y-6">
        {projects.length === 0 ? (
          <FadeUp delay={0.1} className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
              <Rocket className="w-7 h-7" />
            </div>
            <h2 className="text-slate-900 font-bold text-base mb-1">Belum Ada Proyek Aktif</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Belum ada proyek website yang sedang dikerjakan saat ini. Hubungi tim kami untuk konsultasi dan memulai proyek Anda.
            </p>
            <Link href="/portal/tickets">
              <button className="bg-[#1E242E] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors">
                Mulai Konsultasi Baru
              </button>
            </Link>
          </FadeUp>
        ) : (
          <StaggerChildren className="space-y-6">
            {projects.map((project) => {
              const currentIdx = STATUS_ORDER[project.status as ProjectStatus] ?? 0;

              return (
                <StaggerItem key={project.id}>
                  <FadeUp className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2.5 mb-1">
                            <h2 className="text-slate-900 font-black text-lg tracking-tight">{project.name}</h2>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                              {project.status}
                            </span>
                          </div>
                          {project.description && (
                            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl">{project.description}</p>
                          )}
                        </div>
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-colors shrink-0 shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Buka Website
                          </a>
                        )}
                      </div>

                      {/* Dates row */}
                      {(project.startDate || project.deadline) && (
                        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-200/60 text-xs">
                          {project.startDate && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Mulai:</span>
                              <span className="text-slate-800 font-semibold">{fmtDate(project.startDate)}</span>
                            </div>
                          )}
                          {project.deadline && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Target rilis:</span>
                              <span className="text-slate-800 font-semibold">{fmtDate(project.deadline)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Vertical timeline */}
                    <div className="px-6 py-6">
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
                                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                                  isCompleted
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                    : isCurrent
                                    ? "bg-[#1E242E] border-slate-800 text-white ring-4 ring-slate-200 scale-105"
                                    : "bg-slate-100 border-slate-200 text-slate-400"
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : isCurrent ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                  ) : (
                                    <span className="text-[11px] font-bold">{i + 1}</span>
                                  )}
                                </div>
                                {/* Vertical line */}
                                {!isLast && (
                                  <div className={`w-0.5 flex-1 my-1.5 min-h-8 transition-colors ${
                                    isCompleted ? "bg-emerald-400/60" : "bg-slate-200"
                                  }`} />
                                )}
                              </div>

                              {/* Content card */}
                              <div className={`flex-1 mb-4 ${isLast ? "mb-0" : ""}`}>
                                <div className={`rounded-xl border p-4 transition-all duration-200 ${
                                  isCurrent
                                    ? "bg-slate-50 border-slate-300 shadow-2xs"
                                    : isCompleted
                                    ? "bg-emerald-50/40 border-emerald-200/80"
                                    : "bg-white border-slate-100 text-slate-400"
                                }`}>
                                  {/* Stage meta */}
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                      isCurrent
                                        ? "bg-[#1E242E] text-white"
                                        : isCompleted
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-slate-100 text-slate-500"
                                    }`}>
                                      {stage.sublabel}
                                    </span>
                                    {isCurrent && (
                                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse" />
                                        Sedang berjalan
                                      </span>
                                    )}
                                    {isCompleted && (
                                      <span className="text-[11px] font-bold text-emerald-700">Selesai</span>
                                    )}
                                  </div>

                                  {/* Stage name */}
                                  <h3 className={`font-bold text-sm mb-1 ${
                                    isCurrent ? "text-slate-900" : isCompleted ? "text-slate-800" : "text-slate-400"
                                  }`}>
                                    {stage.label}
                                  </h3>

                                  {/* Stage description */}
                                  <p className={`text-xs leading-relaxed ${
                                    isCurrent ? "text-slate-600" : isCompleted ? "text-slate-500" : "text-slate-400/80"
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
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200/90 rounded-xl">
                          <p className="text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
                            Catatan dari Tim Pengembang
                          </p>
                          <p className="text-amber-950 text-xs leading-relaxed font-medium">{project.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions: Asset Upload & Feedback */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Punya pertanyaan, feedback revisi, atau ingin mengirim logo dan konten?
                      </p>
                      <Link href="/portal/tickets">
                        <button className="flex items-center gap-2 bg-[#1E242E] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Diskusi / Kirim Tiket
                        </button>
                      </Link>
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
