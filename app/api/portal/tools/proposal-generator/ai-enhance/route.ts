import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAiSettings } from "@/lib/aiSettings";
import { getAnthropic, logAiUsage } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `Kamu adalah copywriter profesional untuk proposal bisnis Indonesia.
Tugasmu: memperkaya dan memperluas teks section proposal agar lebih profesional, detail, dan meyakinkan.

Aturan:
- Tulis dalam Bahasa Indonesia yang formal tapi tidak kaku
- Pertahankan makna asli, tambahkan detail dan konteks
- Panjang output: 2-4 kalimat (lebih panjang dari input)
- Jangan tambahkan informasi yang tidak bisa diverifikasi
- Jangan gunakan superlatives berlebihan
- Sebutkan nama bisnis/prospek jika tersedia dalam konteks
- Return ONLY the enhanced text, no explanation or prefix`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });
  if (!user?.client) {
    return NextResponse.json({ error: "Client not found" }, { status: 401 });
  }
  const clientId = user.client.id;

  const settings = await getAiSettings();
  const model = settings.model;

  const { allowed } = await rateLimit(`ai:proposal-enhance:${clientId}`, 20, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const sectionTitle = typeof body.sectionTitle === "string" ? body.sectionTitle.trim() : "";
    const sectionBody = typeof body.sectionBody === "string" ? body.sectionBody.trim() : "";
    const context = body.context && typeof body.context === "object" ? body.context : {};

    if (!sectionBody) {
      return NextResponse.json({ error: "sectionBody wajib diisi." }, { status: 400 });
    }

    const contextParts: string[] = [];
    if (context.prospectName) contextParts.push(`Nama prospek: ${context.prospectName}`);
    if (context.businessName) contextParts.push(`Nama bisnis: ${context.businessName}`);
    if (context.templateName) contextParts.push(`Template: ${context.templateName}`);

    const userMessage = [
      sectionTitle ? `Section: ${sectionTitle}` : "",
      `Teks: ${sectionBody}`,
      contextParts.length > 0 ? `\nKonteks:\n${contextParts.join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await getAnthropic().messages.create({
      model,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const enhanced = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";

    logAiUsage({
      feature: "proposal_enhance",
      model,
      status: "success",
      actor: session.user.email,
      logging: settings.usageLogging,
    });

    return NextResponse.json({ enhanced });
  } catch (err) {
    console.error("[AI-ProposalEnhance]", err);
    logAiUsage({
      feature: "proposal_enhance",
      model,
      status: "error",
      actor: session.user.email,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: settings.usageLogging,
    });
    return NextResponse.json({ error: "Gagal memproses enhancement" }, { status: 500 });
  }
}
