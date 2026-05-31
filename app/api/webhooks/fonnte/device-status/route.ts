import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type WebhookPayload = Record<string, unknown>;

/**
 * POST /api/webhooks/fonnte/device-status
 *
 * Fonnte sends real-time device status updates to this webhook.
 * Configure this URL in Fonnte dashboard → Webhook → Device Status.
 *
 * Payload from Fonnte:
 * {
 *   device: "628xxx",      // device phone number
 *   status: "connect" | "disconnect",
 *   timestamp: 1234567890,
 *   reason?: string        // reason for disconnect (e.g. "logged out", "banned")
 * }
 *
 * Fonnte may send this as JSON or form-urlencoded depending on configuration,
 * so parse defensively the same way the inbound webhook does.
 */
async function readWebhookPayload(req: NextRequest): Promise<WebhookPayload> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await req.json()) as WebhookPayload;
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    return Object.fromEntries(Array.from(form.entries()).map(([k, v]) => [k, String(v)]));
  }

  const text = await req.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as WebhookPayload;
  } catch {
    return Object.fromEntries(new URLSearchParams(text).entries());
  }
}

function pickString(payload: WebhookPayload, keys: string[]): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

/**
 * Fonnte timestamps can arrive as seconds (10 digits) or milliseconds (13 digits).
 * Normalize to a Date, falling back to "now" if the value is missing or unparseable.
 */
function parseTimestamp(raw: unknown): Date {
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
  if (!Number.isFinite(n) || n <= 0) return new Date();
  // 13+ digits → already milliseconds; 10 digits → seconds.
  const ms = n >= 1e12 ? n : n * 1000;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await readWebhookPayload(req);

    const device = pickString(payload, ["device", "Device", "deviceNumber", "device_number"]);
    const status = pickString(payload, ["status", "Status"]);
    const reason = pickString(payload, ["reason", "Reason", "message", "Message"]) || null;
    const eventAt = parseTimestamp(payload.timestamp ?? payload.Timestamp ?? payload.time);

    if (!device || !status) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    // Store device status in site_settings for dashboard display
    const key = `fonnte_device_status_${device.replace(/\D/g, "")}`;
    const value = JSON.stringify({
      device,
      status,
      timestamp: eventAt.toISOString(),
      reason,
      updatedAt: new Date().toISOString(),
    });
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    // Log for monitoring
    console.log(
      `[Fonnte Webhook] Device ${device}: ${status}` +
        (reason ? ` (reason: ${reason})` : "") +
        ` at ${eventAt.toISOString()}`,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fonnte Webhook] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
