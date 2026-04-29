import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { topic, keywords, tone, length } = await req.json();
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const system = `You are an expert SEO content writer for Indonesian local businesses.
Write in Bahasa Indonesia.
Produce HTML compatible with Tiptap editor (use <h2>, <h3>, <p>, <ul>, <li>, <strong> tags).
Return a JSON object with: title, content (HTML string), excerpt (1-2 sentences plain text summary for article listing), metaTitle, metaDescription, and suggestedTags (array).
The tone should be ${tone || "informative"}.
The length should be ${length || "medium"}.`;

    const prompt = `Write a high-quality blog article about: ${topic}. 
Keywords to include: ${keywords?.join(", ") || "relevant industry terms"}.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gagal mengurai respons AI");
    
    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[AI-Draft]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
