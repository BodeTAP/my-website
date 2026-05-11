import { NextRequest } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { getEnabledAiSettings } from "@/lib/aiSettings";
import { getAnthropic, logAiUsage, renderAiPrompt } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const aiGate = await getEnabledAiSettings("pricingEstimator");
  if (!aiGate.enabled) {
    logAiUsage({
      feature: "pricing_estimator",
      model: aiGate.settings.features.pricingEstimator.model,
      status: "blocked",
      actor: ip,
      logging: aiGate.settings.usageLogging,
    });
    return aiGate.response;
  }

  const aiSettings = aiGate.settings;
  const aiConfig = aiSettings.features.pricingEstimator;
  const { allowed } = await rateLimit(`estimasi-harga:${ip}`, aiConfig.rateLimit, aiConfig.rateWindowMs);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }), { status: 429 });
  }

  try {
    const { bisnisType, websiteType, fitur, halaman, timeline } = await req.json();

    const safe = (v: unknown, max = 200) => typeof v === "string" ? v.slice(0, max).replace(/[<>]/g, "") : "";
    const safeList = (v: unknown, max = 10) =>
      Array.isArray(v) ? v.slice(0, max).map((i) => safe(i, 100)) : [];

    const system = renderAiPrompt(aiConfig.prompt, {
      pricingGuide: aiSettings.pricingGuide,
    });

    const prompt = `Tolong berikan estimasi harga website dengan detail berikut:
- Jenis bisnis: ${safe(bisnisType)}
- Jenis website: ${safe(websiteType)}
- Fitur yang dibutuhkan: ${safeList(fitur).join(", ") || "Standar"}
- Jumlah halaman: ${safe(halaman, 50)}
- Target selesai: ${safe(timeline, 100)}

Berikan:
1. Estimasi harga (range min-max)
2. Breakdown komponen biaya
3. Estimasi waktu pengerjaan
4. Rekomendasi paket yang paling sesuai
5. Tips menghemat biaya (jika ada)`;

    const anthropic = getAnthropic();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const response = anthropic.messages.stream({
            model:      aiConfig.model,
            max_tokens: aiConfig.maxTokens,
            system,
            messages:   [{ role: "user", content: prompt }],
          });
          for await (const chunk of response) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          logAiUsage({ feature: "pricing_estimator", model: aiConfig.model, status: "success", actor: ip, logging: aiSettings.usageLogging });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type":           "text/plain; charset=utf-8",
        "Cache-Control":          "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[Estimasi-Harga]", err);
    logAiUsage({
      feature: "pricing_estimator",
      model:   aiConfig.model,
      status:  "error",
      actor:   ip,
      error:   err instanceof Error ? err.message : "Unknown error",
      logging: aiSettings.usageLogging,
    });
    return new Response(JSON.stringify({ error: "Gagal memproses estimasi" }), { status: 500 });
  }
}
