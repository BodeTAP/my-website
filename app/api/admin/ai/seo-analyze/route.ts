import { NextRequest, NextResponse } from "next/server";
import { auth, requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import Anthropic from "@anthropic-ai/sdk";
import { getAiSettings } from "@/lib/aiSettings";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;
  const session = await auth();
  const { allowed } = await rateLimit(`ai-seo:${session!.user!.email}`, 30, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Terlalu banyak request AI. Coba lagi dalam 1 jam." }, { status: 429 });

  try {
    const { title, content, metaTitle, metaDescription } = await req.json();
    if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "Title dan content wajib diisi." }, { status: 400 });
    const [anthropic, aiSettings] = [
      new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      await getAiSettings(),
    ];

    // Strip HTML tags and truncate content to prevent huge prompts
    const textOnly = content.replace(/<[^>]*>/g, " ").slice(0, 8000);

    const system = `You are an SEO expert. Analyze the provided content and return a JSON object with:
{
  "overallScore": number (0-100),
  "titleScore": number,
  "metaScore": number,
  "readabilityScore": number,
  "keywordScore": number,
  "suggestions": string[] (max 5, actionable, in Bahasa Indonesia)
}
Return ONLY valid JSON.`;

    const prompt = `Title: ${title}
Meta Title: ${metaTitle || "N/A"}
Meta Description: ${metaDescription || "N/A"}
Content: ${textOnly.slice(0, 5000)}`;

    const response = await anthropic.messages.create({
      model: aiSettings.model,
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gagal mengurai respons AI");

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[AI-SEO]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
