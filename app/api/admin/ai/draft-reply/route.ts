import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { getAnthropic, logAiUsage } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;
  const session = await auth();
  const aiGate = await getEnabledAiSettings("draftReply");
  if (!aiGate.enabled) {
    logAiUsage({
      feature: "draft_reply",
      model: aiGate.settings.features.draftReply.model,
      status: "blocked",
      actor: session!.user!.email,
      logging: aiGate.settings.usageLogging,
    });
    return aiGate.response;
  }

  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.draftReply;
  const { allowed } = await rateLimit(`ai-reply:${session!.user!.email}`, aiConfig.rateLimit, aiConfig.rateWindowMs);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi nanti." }, { status: 429 });

  try {
    const { ticketId } = await req.json();
    if (!ticketId?.trim()) return NextResponse.json({ error: "ticketId wajib diisi." }, { status: 400 });

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        client: {
          include: {
            projects: { where: { status: { not: "LIVE" } }, take: 1 },
            invoices: { where: { status: "UNPAID" }, take: 3 },
          },
        },
      },
    });

    if (!ticket) return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });

    const context = `
Client: ${ticket.client.businessName}
Subject: ${ticket.subject}
Messages:
${ticket.messages.map(m => `${m.senderRole}: ${m.body}`).join("\n")}

Active Project: ${ticket.client.projects[0]?.name || "None"} (${ticket.client.projects[0]?.status || "N/A"})
Unpaid Invoices: ${ticket.client.invoices.map(i => i.invoiceNo).join(", ") || "None"}
    `.trim();

    const response = await getAnthropic().messages.create({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      system: aiConfig.prompt,
      messages: [{ role: "user", content: context }],
    });

    const draft = response.content[0]?.type === "text" ? response.content[0].text : "";
    logAiUsage({
      feature: "draft_reply",
      model: aiConfig.model,
      status: "success",
      actor: session!.user!.email,
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json({ draft });
  } catch (err) {
    console.error("[AI-DraftReply]", err);
    logAiUsage({
      feature: "draft_reply",
      model: aiConfig.model,
      status: "error",
      actor: session!.user!.email,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
