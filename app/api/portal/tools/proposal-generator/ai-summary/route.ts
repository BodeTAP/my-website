import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAiSettings } from "@/lib/aiSettings";
import { getAnthropic, logAiUsage } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `Kamu adalah business analyst yang merangkum proposal.
Tugasmu: buat ringkasan eksekutif 2-3 kalimat dari proposal yang diberikan.

Aturan:
- Bahasa Indonesia formal dan ringkas
- Sebutkan: apa yang ditawarkan, untuk siapa, dan value utama
- Maksimal 3 kalimat
- Jangan tambahkan informasi baru yang tidak ada di sections
- Return ONLY the summary text`;

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

  const { allowed } = await rateLimit(`ai:proposal-summary:${clientId}`, 20, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const sections = Array.isArray(body.sections) ? body.sections : [];
    const prospectName = typeof body.prospectName === "string" ? body.prospectName.trim() : "";
    const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";

    if (!title || sections.length === 0) {
      return NextResponse.json(
        { error: "title dan sections wajib diisi." },
        { status: 400 },
      );
    }

    const sectionsText = sections
      .map((s: { title?: string; body?: string }) => {
        const sTitle = typeof s.title === "string" ? s.title : "";
        const sBody = typeof s.body === "string" ? s.body : "";
        return `## ${sTitle}\n${sBody}`;
      })
      .join("\n\n");

    const userMessage = [
      `Judul Proposal: ${title}`,
      prospectName ? `Prospek: ${prospectName}` : "",
      businessName ? `Bisnis: ${businessName}` : "",
      `\nIsi Proposal:\n${sectionsText}`,
    ]
      .filter(Boolean)
      .join("\n");

    const response = await getAnthropic().messages.create({
      model,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const summary = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";

    logAiUsage({
      feature: "proposal_summary",
      model,
      status: "success",
      actor: session.user.email,
      logging: settings.usageLogging,
    });

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[AI-ProposalSummary]", err);
    logAiUsage({
      feature: "proposal_summary",
      model,
      status: "error",
      actor: session.user.email,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: settings.usageLogging,
    });
    return NextResponse.json({ error: "Gagal membuat ringkasan proposal" }, { status: 500 });
  }
}
