import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { getAiSettings } from "@/lib/aiSettings";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await auth();
  const { allowed } = await rateLimit(`ai-reply:${session!.user!.email}`, 20, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi dalam 1 jam." }, { status: 429 });

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

    const [anthropic, aiSettings] = [
      new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      await getAiSettings(),
    ];

    const context = `
Client: ${ticket.client.businessName}
Subject: ${ticket.subject}
Messages:
${ticket.messages.map(m => `${m.senderRole}: ${m.body}`).join("\n")}

Active Project: ${ticket.client.projects[0]?.name || "None"} (${ticket.client.projects[0]?.status || "N/A"})
Unpaid Invoices: ${ticket.client.invoices.map(i => i.invoiceNo).join(", ") || "None"}
    `.trim();

    const system = `You are a customer support agent for MFWEB web agency. 
Friendly but professional. Write in Bahasa Indonesia. 
Respond specifically to the client's issue based on the provided context.
Do NOT make promises about deadlines or prices.
Keep the response helpful and concise.`;

    const response = await anthropic.messages.create({
      model: aiSettings.model,
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: context }],
    });

    const draft = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ draft });
  } catch (err) {
    console.error("[AI-DraftReply]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
