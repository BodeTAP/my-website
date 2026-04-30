import { NextResponse, after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendProjectStatusEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendWA, waMsg } from "@/lib/whatsapp";

const STATUS_LABELS: Record<string, string> = {
  DRAFTING:    "Perancangan & Briefing",
  DEVELOPMENT: "Pengembangan Website",
  TESTING:     "Testing & Review",
  LIVE:        "Live! 🚀",
};

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
        await sendWA(project.client.phone, waMsg.projectStatus(clientName, project.name, status));
      }
    });
  }

  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
