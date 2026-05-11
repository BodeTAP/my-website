import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { getAnthropic, logAiUsage, renderAiPrompt } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const ip = getClientIP(req);
  const actor = session.user.email;
  const aiGate = await getEnabledAiSettings("portalChat");
  if (!aiGate.enabled) {
    logAiUsage({
      feature: "portal_chat",
      model: aiGate.settings.features.portalChat.model,
      status: "blocked",
      actor,
      logging: aiGate.settings.usageLogging,
    });
    return aiGate.response;
  }

  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.portalChat;
  const { allowed } = await rateLimit(`ai-help:${actor}:${ip}`, aiConfig.rateLimit, aiConfig.rateWindowMs);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }), { status: 429 });
  }

  try {
    const { question } = await req.json();
    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: "Pertanyaan tidak boleh kosong." }), { status: 400 });
    }
    const safeQuestion = String(question).slice(0, aiSettings.portalMaxQuestionChars).replace(/[<>]/g, "");

    const client = await prisma.client.findFirst({
      where: { user: { email: actor } },
      include: {
        projects: aiSettings.portalIncludeProjects ? { select: { name: true, status: true } } : false,
        invoices: aiSettings.portalIncludeInvoices ? {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { invoiceNo: true, amount: true, status: true, dueDate: true },
        } : false,
        _count: aiSettings.portalIncludeTickets ? { select: { tickets: { where: { status: "OPEN" } } } } : false,
      },
    });

    if (!client) {
      return new Response(JSON.stringify({ error: "Data klien tidak ditemukan" }), { status: 404 });
    }

    const projectList = aiSettings.portalIncludeProjects && "projects" in client
      ? client.projects.map((p) => `${p.name} (${p.status})`).join(", ").slice(0, 500) || "None"
      : "Disabled";
    const invoiceList = aiSettings.portalIncludeInvoices && "invoices" in client
      ? client.invoices.map((i) => `${i.invoiceNo}: ${i.status}`).join(", ").slice(0, 300) || "None"
      : "Disabled";
    const openTickets = aiSettings.portalIncludeTickets && "_count" in client
      ? client._count.tickets
      : "Disabled";

    const context = `
Projects: ${projectList}
Recent Invoices: ${invoiceList}
Open Tickets: ${openTickets}
    `.trim();

    const system = renderAiPrompt(aiConfig.prompt, {
      fallbackAnswer: aiSettings.portalFallbackAnswer,
    });

    const anthropic = getAnthropic();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const response = anthropic.messages.stream({
            model:      aiConfig.model,
            max_tokens: aiConfig.maxTokens,
            system,
            messages:   [{ role: "user", content: `Question: ${safeQuestion}\n\nContext:\n${context}` }],
          });
          for await (const chunk of response) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          logAiUsage({ feature: "portal_chat", model: aiConfig.model, status: "success", actor, logging: aiSettings.usageLogging });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type":  "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[Portal-AI-Help]", err);
    logAiUsage({
      feature: "portal_chat",
      model:   aiConfig.model,
      status:  "error",
      actor,
      error:   err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return new Response(JSON.stringify({ error: "Gagal memproses pertanyaan" }), { status: 500 });
  }
}
