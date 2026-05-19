import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone, sendWA } from "@/lib/whatsapp";
import { loadBroadcastSettings } from "@/lib/broadcastSettings.server";
import { buildKeywordRegex, renderBroadcastTemplate, type BroadcastRuntimeSettings } from "@/lib/broadcastSettings";
import { getFonnteKeyForDevice } from "@/lib/getFonnteKey";

type WebhookPayload = Record<string, unknown>;
type MatchedLead = {
  id: string;
  name: string;
  businessName: string;
  whatsapp: string;
  waOptInStatus: "UNKNOWN" | "OPTED_IN" | "OPTED_OUT";
  doNotContact: boolean;
};

function pickString(payload: WebhookPayload, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return pickString(data as WebhookPayload, keys);
  }

  return null;
}

async function readWebhookPayload(req: NextRequest): Promise<WebhookPayload> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await req.json() as WebhookPayload;
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    return Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, String(value)]));
  }

  const text = await req.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as WebhookPayload;
  } catch {
    return Object.fromEntries(new URLSearchParams(text).entries());
  }
}

function phoneCandidates(raw: string): string[] {
  const normalized = normalizePhone(raw.replace(/@.+$/, ""));
  const local = normalized.startsWith("62") ? `0${normalized.slice(2)}` : normalized;
  const withoutCountry = normalized.startsWith("62") ? normalized.slice(2) : normalized;
  return [...new Set([raw, normalized, local, withoutCountry].filter(Boolean))];
}

function webhookSecretMatches(req: NextRequest): boolean {
  const expected = process.env.FONNTE_WEBHOOK_SECRET;
  if (!expected) return true;

  const provided =
    req.headers.get("x-webhook-secret") ??
    req.headers.get("x-fonnte-secret") ??
    req.nextUrl.searchParams.get("secret");

  return provided === expected;
}

function buildOptInPromoMessage(lead: MatchedLead, settings: BroadcastRuntimeSettings): string {
  return renderBroadcastTemplate(settings.optInPromoTemplate, lead, settings);
}

function buildOptOutReplyMessage(lead: MatchedLead, settings: BroadcastRuntimeSettings): string {
  return renderBroadcastTemplate(settings.optOutReplyTemplate, lead, settings);
}

function uniqueByPhone(leads: MatchedLead[]): MatchedLead[] {
  const seen = new Set<string>();
  return leads.filter((lead) => {
    const phone = normalizePhone(lead.whatsapp);
    if (seen.has(phone)) return false;
    seen.add(phone);
    return true;
  });
}

async function findLeadsBySender(sender: string): Promise<MatchedLead[]> {
  const candidates = phoneCandidates(sender);
  const normalizedSender = normalizePhone(sender);
  const lastDigits = normalizedSender.slice(-8);
  const possibleLeads = await prisma.lead.findMany({
    where: {
      OR: [
        { whatsapp: { in: candidates } },
        ...(lastDigits ? [{ whatsapp: { contains: lastDigits } }] : []),
      ],
    },
    select: {
      id: true,
      name: true,
      businessName: true,
      whatsapp: true,
      waOptInStatus: true,
      doNotContact: true,
    },
  });

  return possibleLeads
    .filter((lead) => {
      const normalizedLead = normalizePhone(lead.whatsapp);
      return (
        candidates.includes(lead.whatsapp) ||
        normalizedLead === normalizedSender ||
        (lastDigits.length > 0 && normalizedLead.endsWith(lastDigits))
      );
    })
}

export async function POST(req: NextRequest) {
  if (!webhookSecretMatches(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await readWebhookPayload(req);
    const text = pickString(payload, ["message", "Message", "text", "Text", "body", "Body", "content", "msg"]);
    const sender = pickString(payload, ["sender", "Sender", "from", "phone", "whatsapp", "number", "target"]);
    // `device` = nomor WA device yang menerima pesan (dikirim Fonnte di payload)
    const deviceNumber = pickString(payload, ["device", "Device", "deviceNumber", "device_number"]) ?? "";

    if (!text || !sender) {
      console.warn("[Fonnte Inbound Webhook] Invalid payload", {
        keys: Object.keys(payload),
        hasText: Boolean(text),
        hasSender: Boolean(sender),
      });
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const normalizedText = text.trim();
    const settings = await loadBroadcastSettings();
    const isOptOut = buildKeywordRegex(settings.optOutKeywords).test(normalizedText);
    const isOptIn = buildKeywordRegex(settings.optInKeywords).test(normalizedText);
    if (!isOptOut && !isOptIn) {
      return NextResponse.json({ ok: true, optedIn: false, optedOut: false });
    }

    const leads = await findLeadsBySender(sender);
    const leadIds = leads.map((lead) => lead.id);

    if (leadIds.length === 0) {
      console.warn("[Fonnte Inbound Webhook] Lead not found", { sender: normalizePhone(sender), text: normalizedText.slice(0, 30) });
      return NextResponse.json({ ok: true, optedIn: false, optedOut: false, reason: "lead_not_found" });
    }

    if (isOptOut) {
      const leadsToAutoReply = uniqueByPhone(leads);

      await prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: {
          waOptInStatus:  "OPTED_OUT",
          waOptOutAt:     new Date(),
          waOptOutReason: normalizedText.slice(0, 100),
          doNotContact:   true,
        },
      });

      // Resolve the device-specific API key so the reply comes from the same number
      const deviceApiKey = await getFonnteKeyForDevice(deviceNumber);

      const autoReplies = settings.autoReplyOptOut
        ? await Promise.all(
            leadsToAutoReply.map(async (lead) => ({
              leadId: lead.id,
              sent:   await sendWA(sender, buildOptOutReplyMessage(lead, settings), deviceApiKey),
            })),
          )
        : [];
      const autoReplySent = autoReplies.filter((reply) => reply.sent).length;

      return NextResponse.json({
        ok: true,
        optedOut: true,
        count: leadIds.length,
        autoReply: {
          attempted: autoReplies.length,
          sent:      autoReplySent,
          failed:    autoReplies.length - autoReplySent,
        },
      });
    }

    const leadsToAutoReply = uniqueByPhone(
      leads.filter((lead) => lead.waOptInStatus !== "OPTED_IN" || lead.doNotContact),
    );

    // Try to find the last broadcast that was sent to this lead for conversion tracking
    const lastBroadcastRecipient = await prisma.broadcastRecipient.findFirst({
      where: {
        leadId: { in: leadIds },
        status: { in: ["QUEUED", "SENT"] },
      },
      orderBy: { createdAt: "desc" },
      select: { broadcastId: true },
    });
    const optInSource = lastBroadcastRecipient
      ? `fonnte_webhook:broadcast:${lastBroadcastRecipient.broadcastId}`
      : "fonnte_webhook";

    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: {
        waOptInStatus:  "OPTED_IN",
        waOptInAt:      new Date(),
        waOptInSource:  optInSource,
        waOptOutAt:     null,
        waOptOutReason: null,
        doNotContact:   false,
      },
    });

    // Resolve the device-specific API key so the reply comes from the same number
    const deviceApiKey = await getFonnteKeyForDevice(deviceNumber);

    const autoReplies = settings.autoReplyOptIn
      ? await Promise.all(
          leadsToAutoReply.map(async (lead) => ({
            leadId: lead.id,
            sent:   await sendWA(sender, buildOptInPromoMessage(lead, settings), deviceApiKey),
          })),
        )
      : [];

    const autoReplySent = autoReplies.filter((reply) => reply.sent).length;

    return NextResponse.json({
      ok: true,
      optedIn: true,
      count: leadIds.length,
      autoReply: {
        attempted: autoReplies.length,
        sent:      autoReplySent,
        failed:    autoReplies.length - autoReplySent,
      },
    });
  } catch (err) {
    console.error("[Fonnte Inbound Webhook]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
