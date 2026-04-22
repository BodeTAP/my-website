import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle } from "lucide-react";

const PROJECT_STEPS = ["DRAFTING", "DEVELOPMENT", "TESTING", "LIVE"] as const;
const PROJECT_LABELS: Record<string, string> = {
  DRAFTING: "Perancangan Desain",
  DEVELOPMENT: "Pengembangan",
  TESTING: "Testing & QA",
  LIVE: "Website Live",
};
const STATUS_COLOR: Record<string, string> = {
  DRAFTING: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  DEVELOPMENT: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  TESTING: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  LIVE: "bg-green-500/15 text-green-300 border-green-500/20",
};

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Proyek Saya</h1>
        <p className="text-blue-200/50 text-sm mt-1">{projects.length} proyek</p>
      </div>

      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-blue-200/30">
            Belum ada proyek aktif
          </div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-white font-bold text-lg">{p.name}</h2>
                  {p.description && (
                    <p className="text-blue-200/50 text-sm mt-1">{p.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={STATUS_COLOR[p.status]}>
                    {PROJECT_LABELS[p.status]}
                  </Badge>
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                    </a>
                  )}
                </div>
              </div>

              {/* Progress stepper */}
              <div className="flex items-center">
                {PROJECT_STEPS.map((step, i) => {
                  const isCompleted = PROJECT_STEPS.indexOf(p.status as typeof PROJECT_STEPS[number]) > i;
                  const isCurrent = p.status === step;

                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? "bg-green-500 border-green-500"
                            : isCurrent
                            ? "bg-blue-600 border-blue-500 ring-4 ring-blue-500/20"
                            : "bg-transparent border-white/10"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <span className={`text-xs font-bold ${isCurrent ? "text-white" : "text-blue-200/30"}`}>
                              {i + 1}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs whitespace-nowrap hidden sm:block ${
                          isCurrent ? "text-white font-semibold" : isCompleted ? "text-green-400" : "text-blue-200/30"
                        }`}>
                          {PROJECT_LABELS[step].split(" ")[0]}
                        </span>
                      </div>
                      {i < PROJECT_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 ${isCompleted ? "bg-green-500" : "bg-white/5"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {p.deadline && (
                <p className="text-blue-200/40 text-xs mt-4">
                  Target selesai:{" "}
                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(p.deadline))}
                </p>
              )}
              {p.notes && (
                <div className="mt-4 p-3 bg-blue-500/5 rounded-xl">
                  <p className="text-blue-200/60 text-xs">{p.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
