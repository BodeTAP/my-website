import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { getAiSettings } from "@/lib/aiSettings";

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const { allowed } = await rateLimit(`estimasi-harga:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi dalam 1 jam." }), { status: 429 });
  }

  const aiSettings = await getAiSettings();
  if (!aiSettings.featurePricingEstimator) {
    return new Response(JSON.stringify({ error: "Fitur estimasi harga sedang nonaktif." }), { status: 503 });
  }

  try {
    const { bisnisType, websiteType, fitur, halaman, timeline } = await req.json();

    const system = `Kamu adalah konsultan web agency MFWEB yang bertugas memberikan estimasi harga pembuatan website untuk calon klien.

Panduan harga MFWEB (gunakan sebagai acuan realistis):
- Landing Page (1-3 halaman): Rp 800.000 - Rp 2.500.000
- Company Profile (4-8 halaman): Rp 2.500.000 - Rp 6.000.000
- Website Toko Online (WooCommerce/custom): Rp 5.000.000 - Rp 15.000.000
- Portal / Aplikasi Web Custom: Rp 15.000.000 - Rp 50.000.000+
- Blog / News Portal: Rp 3.000.000 - Rp 8.000.000

Fitur tambahan:
- Payment gateway: +Rp 1.000.000 - Rp 2.500.000
- Sistem booking/reservasi: +Rp 1.500.000 - Rp 3.000.000
- Live chat/WhatsApp integration: +Rp 300.000 - Rp 800.000
- Multi bahasa: +Rp 500.000 - Rp 1.500.000
- Blog/CMS: +Rp 500.000 - Rp 1.500.000
- SEO setup: +Rp 500.000 - Rp 2.000.000

Berikan estimasi yang jujur dan realistis. Tampilkan dalam format yang mudah dibaca.
Gunakan Bahasa Indonesia yang ramah dan profesional.
Di akhir, selalu sarankan konsultasi gratis untuk estimasi lebih akurat.`;

    const prompt = `Tolong berikan estimasi harga website dengan detail berikut:
- Jenis bisnis: ${bisnisType}
- Jenis website: ${websiteType}
- Fitur yang dibutuhkan: ${fitur?.join(", ") || "Standar"}
- Jumlah halaman: ${halaman}
- Target selesai: ${timeline}

Berikan:
1. Estimasi harga (range min-max)
2. Breakdown komponen biaya
3. Estimasi waktu pengerjaan
4. Rekomendasi paket yang paling sesuai
5. Tips menghemat biaya (jika ada)`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const response = anthropic.messages.stream({
            model:      aiSettings.model,
            max_tokens: 1000,
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
    return new Response(JSON.stringify({ error: "Gagal memproses estimasi" }), { status: 500 });
  }
}
