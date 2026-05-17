import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAiSettings } from "@/lib/aiSettings";
import { getAnthropic, logAiUsage } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `Kamu adalah sales outreach specialist untuk bisnis Indonesia.
Tugasmu: buat pesan WhatsApp pertama yang personal dan tidak spam untuk prospek bisnis lokal.

Aturan:
- Bahasa Indonesia casual tapi sopan
- Sebutkan nama bisnis prospek di awal
- Sebutkan kota untuk menunjukkan relevansi lokal
- Jelaskan value proposition dalam 1-2 kalimat
- Akhiri dengan pertanyaan terbuka (bukan hard sell)
- Gunakan emoji secukupnya (1-3 saja)
- Panjang: 4-6 kalimat
- Jangan gunakan template yang terasa copy-paste
- Return ONLY the message text`;

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

  const { allowed } = await rateLimit(`ai:lead-outreach:${clientId}`, 30, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const leadName = typeof body.leadName === "string" ? body.leadName.trim() : "";
    const leadCategory = typeof body.leadCategory === "string" ? body.leadCategory.trim() : "";
    const leadCity = typeof body.leadCity === "string" ? body.leadCity.trim() : "";
    const senderBusinessName = typeof body.senderBusinessName === "string" ? body.senderBusinessName.trim() : "";
    const senderService = typeof body.senderService === "string" ? body.senderService.trim() : "";

    if (!leadName || !senderBusinessName) {
      return NextResponse.json(
        { error: "leadName dan senderBusinessName wajib diisi." },
        { status: 400 },
      );
    }

    const userMessage = [
      `Nama bisnis prospek: ${leadName}`,
      leadCategory ? `Kategori: ${leadCategory}` : "",
      leadCity ? `Kota: ${leadCity}` : "",
      `Pengirim: ${senderBusinessName}`,
      senderService ? `Layanan yang ditawarkan: ${senderService}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await getAnthropic().messages.create({
      model,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const message = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";

    logAiUsage({
      feature: "lead_outreach",
      model,
      status: "success",
      actor: session.user.email,
      logging: settings.usageLogging,
    });

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[AI-LeadOutreach]", err);
    logAiUsage({
      feature: "lead_outreach",
      model,
      status: "error",
      actor: session.user.email,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: settings.usageLogging,
    });
    return NextResponse.json({ error: "Gagal membuat pesan outreach" }, { status: 500 });
  }
}
