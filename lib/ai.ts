import Anthropic from "@anthropic-ai/sdk";
import { getAiSettings } from "@/lib/aiSettings";
import type { AiModel } from "@/lib/aiConfig";

let _anthropic: Anthropic | null = null;
export function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export async function getConfiguredAiModel(): Promise<AiModel> {
  const settings = await getAiSettings();
  return settings.model;
}

function stripJsonFence(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? text).trim();
}

export function extractJsonObject<T>(text: string): T {
  const cleaned = stripJsonFence(text);
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Respons AI tidak mengandung JSON object valid");
  return JSON.parse(jsonMatch[0]) as T;
}

export function extractJsonArray<T>(text: string): T {
  const cleaned = stripJsonFence(text);
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Respons AI tidak mengandung JSON array valid");
  return JSON.parse(jsonMatch[0]) as T;
}

export function logAiUsage(details: {
  feature: string;
  model: string;
  status: "success" | "error" | "blocked";
  actor?: string | null;
  error?: string;
}) {
  console.info("[AI-Usage]", JSON.stringify({
    at: new Date().toISOString(),
    ...details,
  }));
}

/**
 * Menerjemahkan topik Bahasa Indonesia ke keyword Bahasa Inggris yang
 * visual-friendly untuk query ke Pexels stock photo API.
 */
export async function translateToVisualKeyword(topic: string): Promise<string> {
  let model = "unknown";
  try {
    model = await getConfiguredAiModel();
    const response = await getAnthropic().messages.create({
      model,
      max_tokens: 60,
      system: `You are a visual keyword specialist.
Given an Indonesian article topic, return ONLY 2-3 short English keywords that best represent a relevant stock photo.
Focus on visual elements (objects, people, settings), not abstract concepts.
Example: "Cara Meningkatkan Penjualan UMKM" → "small business owner shop indonesia"
Return ONLY the keywords, nothing else.`,
      messages: [{ role: "user", content: topic }],
    });
    const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    logAiUsage({ feature: "cover_keyword", model, status: "success" });
    return text || topic;
  } catch (err) {
    logAiUsage({
      feature: "cover_keyword",
      model,
      status:  "error",
      error:   err instanceof Error ? err.message : "Unknown error",
    });
    return topic; // Fallback ke topik asli jika Claude gagal
  }
}

/**
 * Mengunggah foto dari URL ke Vercel Blob dan mengembalikan URL permanen.
 */
export async function uploadPhotoToBlob(photoUrl: string, prefix = "articles"): Promise<string | null> {
  try {
    const { put } = await import("@vercel/blob");
    const res         = await fetch(photoUrl);
    const buffer      = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext         = contentType.split("/")[1] || "jpg";
    const filename    = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob        = await put(filename, buffer, {
      access:      "public",
      contentType,
      token:       process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  } catch {
    return null;
  }
}

/**
 * Cari foto dari Pexels berdasarkan topik (auto-translate ke keyword Inggris).
 * Mengembalikan URL permanen Vercel Blob, atau null jika gagal.
 */
export async function fetchAndUploadCoverImage(topic: string, blobPrefix = "articles"): Promise<string | null> {
  try {
    const keyword = await translateToVisualKeyword(topic);
    console.log(`[AI-Cover] "${topic}" → "${keyword}"`);

    const res  = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY ?? "" } },
    );
    const data = await res.json() as { photos?: { src: { large: string } }[] };
    const photoUrl = data.photos?.[0]?.src.large;
    if (!photoUrl) return null;

    return await uploadPhotoToBlob(photoUrl, blobPrefix);
  } catch {
    return null;
  }
}
