import { NextResponse, after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendProjectStatusEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendWA } from "@/lib/whatsapp";
import { getSiteSettings, renderSettingTemplate, isWaNotifyEnabled } from "@/lib/siteSettings";

const STATUS_LABELS: Record<string, string> = {
  DRAFTING:    "Perancangan & Briefing",
  DEVELOPMENT: "Pengembangan Website",
  TESTING:     "Testing & Review",
  LIVE:        "Live! 🚀",
};

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("projects");
  if (denied) return denied;

  const { id } = await params;
  const { status, liveUrl, deadline, notes, name, description } = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(name && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(liveUrl !== undefined && { liveUrl: liveUrl || null }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(notes !== undefined && { notes: notes || null }),
    },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  // Notify client only when status changes
  if (status) {
    const clientEmail = project.client.user.email;
    const clientName  = project.client.user.name ?? project.client.businessName;
    const statusLabel = STATUS_LABELS[status] ?? status;
    createNotification(
      project.clientId,
      "PROJECT_STATUS",
      "Status Proyek Diperbarui",
      `${project.name} telah memasuki tahap ${statusLabel}.`,
      "/portal/projects",
    ).catch((e) => console.error("[Notif] project status:", e));

    after(async () => {
      if (clientEmail) {
        await sendProjectStatusEmail(clientEmail, clientName, project.name, status)
          .catch((e) => console.error("[Email] project status:", e));
      }
      if (project.client.phone) {
        const settings = await getSiteSettings();
        if (isWaNotifyEnabled(settings, "wa_notify_project_status")) {
          const PROJECT_STAGE: Record<string, { label: string; desc: string }> = {
            DRAFTING:    { label: "Perancangan & Briefing", desc: "Tim kami sedang mendiskusikan konsep dan desain website Anda." },
            DEVELOPMENT: { label: "Pengembangan Website", desc: "Website Anda sedang aktif dikerjakan oleh tim developer kami." },
            TESTING:     { label: "Testing & Review", desc: "Website sedang diuji coba dan siap untuk review Anda." },
            LIVE:        { label: "Live! 🚀", desc: "Website Anda sudah resmi diluncurkan. Selamat!" },
          };
          const stage = PROJECT_STAGE[status] ?? { label: status, desc: "" };
          const msg = settings.template_wa_project_status
            ? renderSettingTemplate(settings.template_wa_project_status, {
                brandName: settings.brand_name,
                clientName,
                projectName: project.name,
                statusLabel: stage.label,
                statusDesc: stage.desc,
              })
            : `Halo ${clientName}! Update proyek *${project.name}*: ✅ *${stage.label}*\n${stage.desc}\n\nPantau di portal klien.\n\n_${settings.brand_name}_`;
          await sendWA(project.client.phone, msg);
        }
      }
    });
  }

  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("projects");
  if (denied) return denied;

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
