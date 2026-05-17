import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAiSettings } from "@/lib/aiSettings";
import { getAnthropic, extractJsonArray, logAiUsage } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `Kamu adalah admin invoicing profesional.
Tugasmu: buat 3 variasi deskripsi item invoice yang profesional berdasarkan keyword dan konteks.

Aturan:
- Bahasa Indonesia formal
- Setiap deskripsi 1 kalimat (15-30 kata)
- Spesifik dan detail, bukan generic
- Sebutkan deliverable yang jelas
- Jangan sertakan harga
- Return JSON array of 3 strings ONLY`;

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

  const { allowed } = await rateLimit(`ai:invoice-description:${clientId}`, 30, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const keyword = typeof body.keyword === "string" ? body.keyword.trim() : "";
    const context = typeof body.context === "string" ? body.context.trim() : "";

    if (!keyword) {
      return NextResponse.json({ error: "keyword wajib diisi." }, { status: 400 });
    }

    const userMessage = [
      `Keyword: ${keyword}`,
      context ? `Konteks: ${context}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await getAnthropic().messages.create({
      model,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text.trim() : "[]";
    const suggestions = extractJsonArray<string[]>(text);

    logAiUsage({
      feature: "invoice_description",
      model,
      status: "success",
      actor: session.user.email,
      logging: settings.usageLogging,
    });

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[AI-InvoiceDescription]", err);
    logAiUsage({
      feature: "invoice_description",
      model,
      status: "error",
      actor: session.user.email,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: settings.usageLogging,
    });
    return NextResponse.json({ error: "Gagal membuat saran deskripsi" }, { status: 500 });
  }
}
