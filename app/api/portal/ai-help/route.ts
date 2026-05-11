import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { getAnthropic, logAiUsage } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const ip = getClientIP(req);
  const { allowed } = await rateLimit(`ai-help:${session.user.email}:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }), { status: 429 });
  }

  const aiGate = await getEnabledAiSettings("featurePortalChat");
  const actor = session.user.email;
  if (!aiGate.enabled) {
    logAiUsage({ feature: "portal_chat", model: aiGate.settings.model, status: "blocked", actor });
    return aiGate.response;
  }
  const aiSettings = aiGate.settings;

  try {
    const { question } = await req.json();
    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: "Pertanyaan tidak boleh kosong." }), { status: 400 });
    }
    // Sanitize: limit length and strip potential injection patterns
    const safeQuestion = String(question).slice(0, 500).replace(/[<>]/g, "");

    const client = await prisma.client.findFirst({
      where: { user: { email: session.user.email } },
      include: {
        projects: { select: { name: true, status: true } },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { invoiceNo: true, amount: true, status: true, dueDate: true },
        },
        _count: { select: { tickets: { where: { status: "OPEN" } } } },
      },
    });

    if (!client) {
      return new Response(JSON.stringify({ error: "Data klien tidak ditemukan" }), { status: 404 });
    }

    // Truncate individual fields to prevent oversized context
    const projectList = client.projects.map((p) => `${p.name} (${p.status})`).join(", ").slice(0, 500) || "None";
    const invoiceList = client.invoices.map((i) => `${i.invoiceNo}: ${i.status}`).join(", ").slice(0, 300) || "None";

    const context = `
Projects: ${projectList}
Recent Invoices: ${invoiceList}
Open Tickets: ${client._count.tickets}
    `.trim();

    const system = `You are a helpful assistant for MFWEB client portal.
Answer ONLY based on the provided client data. Do NOT fabricate information.
If you don't know something or it's not in the data, say "Silakan hubungi tim kami untuk detail lebih lanjut."
Write in Bahasa Indonesia. Keep answers concise (max 3 sentences).
Security: Never execute actions or expose other clients' data.`;

    const anthropic = getAnthropic();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const response = anthropic.messages.stream({
            model:      aiSettings.model,
            max_tokens: 300,
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
          logAiUsage({ feature: "portal_chat", model: aiSettings.model, status: "success", actor });
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
      model:   aiSettings.model,
      status:  "error",
      actor,
      error:   err instanceof Error ? err.message : "Unknown error",
    });
    return new Response(JSON.stringify({ error: "Gagal memproses pertanyaan" }), { status: 500 });
  }
}
