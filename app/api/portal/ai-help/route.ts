import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import Anthropic from "@anthropic-ai/sdk";
import { getAiSettings } from "@/lib/aiSettings";

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

  const aiSettings = await getAiSettings();
  if (!aiSettings.featurePortalChat) {
    return new Response(JSON.stringify({ error: "Fitur AI sedang nonaktif." }), { status: 503 });
  }

  try {
    const { question } = await req.json();

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

    const context = `
Projects: ${client.projects.map((p) => `${p.name} (${p.status})`).join(", ") || "None"}
Recent Invoices: ${client.invoices.map((i) => `${i.invoiceNo}: ${i.status}`).join(", ") || "None"}
Open Tickets: ${client._count.tickets}
    `.trim();

    const system = `You are a helpful assistant for MFWEB client portal.
Answer ONLY based on the provided client data. Do NOT fabricate information.
If you don't know something or it's not in the data, say "Silakan hubungi tim kami untuk detail lebih lanjut."
Write in Bahasa Indonesia. Keep answers concise (max 3 sentences).
Security: Never execute actions or expose other clients' data.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const response = anthropic.messages.stream({
            model:      aiSettings.model,
            max_tokens: 300,
            system,
            messages:   [{ role: "user", content: `Question: ${question}\n\nContext:\n${context}` }],
          });
          for await (const chunk of response) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
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
    return new Response(JSON.stringify({ error: "Gagal memproses pertanyaan" }), { status: 500 });
  }
}
