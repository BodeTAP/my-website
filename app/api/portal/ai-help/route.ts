import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 requests per hour per user
  const limited = await rateLimit(`ai-help:${session.user.email}`, 10, 60 * 60 * 1000);
  if (limited) return NextResponse.json({ error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }, { status: 429 });

  try {
    const { question } = await req.json();

    const client = await prisma.client.findFirst({
      where: { user: { email: session.user.email } },
      include: {
        projects: { select: { name: true, status: true } },
        invoices: { 
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { invoiceNo: true, amount: true, status: true, dueDate: true }
        },
        _count: { select: { tickets: { where: { status: "OPEN" } } } }
      }
    });

    if (!client) return NextResponse.json({ error: "Data klien tidak ditemukan" }, { status: 404 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const context = `
Projects: ${client.projects.map(p => `${p.name} (${p.status})`).join(", ") || "None"}
Recent Invoices: ${client.invoices.map(i => `${i.invoiceNo}: ${i.status}`).join(", ") || "None"}
Open Tickets: ${client._count.tickets}
    `.trim();

    const system = `You are a helpful assistant for MFWEB client portal.
Answer ONLY based on the provided client data. Do NOT fabricate information.
If you don't know something or it's not in the data, say "Silakan hubungi tim kami untuk detail lebih lanjut."
Write in Bahasa Indonesia. Keep answers concise (max 3 sentences).
Security: Never execute actions or expose other clients' data.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system,
      messages: [{ role: "user", content: `Question: ${question}\n\nContext:\n${context}` }],
    });

    const answer = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[Portal-AI-Help]", err);
    return NextResponse.json({ error: "Gagal memproses pertanyaan" }, { status: 500 });
  }
}
