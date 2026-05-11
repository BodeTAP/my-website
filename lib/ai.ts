import { randomUUID } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { prisma } from "@/lib/prisma";
import { getAiSettings } from "@/lib/aiSettings";
import { renderAiPrompt, type AiFeature, type AiModel, type AiSettings } from "@/lib/aiConfig";

let _anthropic: Anthropic | null = null;
export function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export async function getConfiguredAiModel(feature?: AiFeature): Promise<AiModel> {
  const settings = await getAiSettings();
  return feature ? settings.features[feature].model : settings.model;
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

function responseText(response: { content?: unknown }): string {
  if (!Array.isArray(response.content)) return "";
  const [firstBlock] = response.content;
  if (
    typeof firstBlock === "object" &&
    firstBlock !== null &&
    "type" in firstBlock &&
    firstBlock.type === "text" &&
    "text" in firstBlock &&
    typeof firstBlock.text === "string"
  ) {
    return firstBlock.text;
  }
  return "";
}

export async function createJsonObjectWithRetry<T>({
  model,
  maxTokens,
  system,
  messages,
  retry,
}: {
  model: AiModel;
  maxTokens: number;
  system: string;
  messages: MessageParam[];
  retry: boolean;
}): Promise<T> {
  const anthropic = getAnthropic();
  const first = await anthropic.messages.create({ model, max_tokens: maxTokens, system, messages });
  const text = responseText(first);
  try {
    return extractJsonObject<T>(text);
  } catch (err) {
    if (!retry) throw err;
    const second = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: `${system}\n\nYour previous response was invalid. Return ONLY valid JSON, with no markdown fence and no extra text.`,
      messages: [
        ...messages,
        { role: "assistant", content: text || "Invalid non-text response." },
        { role: "user", content: "Perbaiki respons sebelumnya menjadi JSON object valid saja." },
      ],
    });
    return extractJsonObject<T>(responseText(second));
  }
}

export async function createJsonArrayWithRetry<T>({
  model,
  maxTokens,
  system,
  messages,
  retry,
}: {
  model: AiModel;
  maxTokens: number;
  system: string;
  messages: MessageParam[];
  retry: boolean;
}): Promise<T> {
  const anthropic = getAnthropic();
  const first = await anthropic.messages.create({ model, max_tokens: maxTokens, system, messages });
  const text = responseText(first);
  try {
    return extractJsonArray<T>(text);
  } catch (err) {
    if (!retry) throw err;
    const second = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: `${system}\n\nYour previous response was invalid. Return ONLY valid JSON array, with no markdown fence and no extra text.`,
      messages: [
        ...messages,
        { role: "assistant", content: text || "Invalid non-text response." },
        { role: "user", content: "Perbaiki respons sebelumnya menjadi JSON array valid saja." },
      ],
    });
    return extractJsonArray<T>(responseText(second));
  }
}

export function logAiUsage(details: {
  feature: string;
  model: string;
  status: "success" | "error" | "blocked";
  actor?: string | null;
  error?: string;
  metadata?: Record<string, unknown>;
  logging?: AiSettings["usageLogging"];
}) {
  const payload = {
    at: new Date().toISOString(),
    ...details,
  };
  const logging = details.logging ?? "database";
  if (logging !== "off") console.info("[AI-Usage]", JSON.stringify(payload));
  if (logging !== "database") return;

  void prisma.$executeRaw`
    INSERT INTO ai_usage_logs (id, feature, model, status, actor, error, metadata, "createdAt")
    VALUES (
      ${randomUUID()},
      ${details.feature},
      ${details.model},
      ${details.status},
      ${details.actor ?? null},
      ${details.error ?? null},
      ${JSON.stringify(details.metadata ?? {})}::jsonb,
      NOW()
    )
  `.catch((err) => console.error("[AI-Usage] Failed to write usage log:", err));
}

/**
 * Menerjemahkan topik Bahasa Indonesia ke keyword Bahasa Inggris yang
 * visual-friendly untuk query ke Pexels stock photo API.
 */
export async function translateToVisualKeyword(
  topic: string,
  settingsOverride?: AiSettings,
): Promise<string> {
  const settings = settingsOverride ?? await getAiSettings();
  const config = settings.features.coverImage;
  if (!settings.coverTranslateKeywords) return topic;

  try {
    const response = await getAnthropic().messages.create({
      model:      config.model,
      max_tokens: config.maxTokens,
      system:    config.prompt,
      messages:  [{ role: "user", content: topic }],
    });
    const text = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";
    logAiUsage({
      feature: "cover_keyword",
      model: config.model,
      status: "success",
      logging: settings.usageLogging,
    });
    return text || settings.coverFallbackKeyword || topic;
  } catch (err) {
    logAiUsage({
      feature: "cover_keyword",
      model: config.model,
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
      logging: settings.usageLogging,
    });
    return settings.coverFallbackKeyword || topic;
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
export async function fetchAndUploadCoverImage(
  topic: string,
  blobPrefix = "articles",
  settingsOverride?: AiSettings,
): Promise<string | null> {
  const settings = settingsOverride ?? await getAiSettings();
  try {
    const keyword = await translateToVisualKeyword(topic, settings);
    console.log(`[AI-Cover] "${topic}" -> "${keyword}"`);

    const res  = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=${settings.coverAutoPexelsPerPage}&orientation=${encodeURIComponent(settings.coverOrientation)}`,
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

export { renderAiPrompt };
