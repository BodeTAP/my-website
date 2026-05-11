import { NextRequest } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { createJsonArrayWithRetry, logAiUsage } from "@/lib/ai";
import { getEnabledAiSettings } from "@/lib/aiSettings";

type NameSuggestion = {
  name: string;
  slogan: string;
};

function safeText(value: unknown, max = 120) {
  return typeof value === "string" ? value.slice(0, max).replace(/[<>]/g, "") : "";
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const aiGate = await getEnabledAiSettings("nameGenerator");
  if (!aiGate.enabled) {
    logAiUsage({
      feature: "name_generator",
      model: aiGate.settings.features.nameGenerator.model,
      status: "blocked",
      actor: ip,
      logging: aiGate.settings.usageLogging,
    });
    return aiGate.response;
  }

  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.nameGenerator;
  const { allowed } = await rateLimit(`generator-nama:${ip}`, aiConfig.rateLimit, aiConfig.rateWindowMs);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }), { status: 429 });
  }

  try {
    const { industry, style, keyword } = await req.json();
    const suggestions = await createJsonArrayWithRetry<NameSuggestion[]>({
      model: aiConfig.model,
      maxTokens: aiConfig.maxTokens,
      system: aiConfig.prompt,
      messages: [{
        role: "user",
        content: [
          `Industri: ${safeText(industry, 80) || "jasa"}`,
          `Gaya: ${safeText(style, 80) || "profesional"}`,
          `Kata kunci opsional: ${safeText(keyword, 120) || "-"}`,
        ].join("\n"),
      }],
      retry: aiSettings.jsonRetryEnabled,
    });

    const normalized = suggestions
      .filter((item) => item && typeof item.name === "string" && typeof item.slogan === "string")
      .slice(0, 6)
      .map((item) => ({
        name: item.name.slice(0, 80),
        slogan: item.slogan.slice(0, 160),
      }));

    logAiUsage({
      feature: "name_generator",
      model: aiConfig.model,
      status: "success",
      actor: ip,
      metadata: { count: normalized.length, industry: safeText(industry, 80), style: safeText(style, 80) },
      logging: aiSettings.usageLogging,
    });

    return Response.json({ suggestions: normalized });
  } catch (err) {
    console.error("[Generator-Nama]", err);
    logAiUsage({
      feature: "name_generator",
      model: aiConfig.model,
      status: "error",
      actor: ip,
      error: err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return new Response(JSON.stringify({ error: "Gagal membuat nama bisnis" }), { status: 500 });
  }
}
