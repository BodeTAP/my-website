import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/whatsapp";

const OPT_OUT_RE = /^(stop|batal|berhenti|unsubscribe|jangan\s+kirim|jangan\s+dihubungi|hapus\s+nomor|keluar)\b/i;
const OPT_IN_RE = /^(ya|iya|y|yes|setuju|boleh|ok|oke|lanjut|info)\b/i;

type WebhookPayload = Record<string, unknown>;

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

async function findLeadIdsBySender(sender: string): Promise<string[]> {
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
    select: { id: true, whatsapp: true },
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
    .map((lead) => lead.id);
}

export async function POST(req: NextRequest) {
  if (!webhookSecretMatches(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json() as WebhookPayload;
    const text = pickString(payload, ["message", "text", "body", "content", "msg"]);
    const sender = pickString(payload, ["sender", "from", "phone", "whatsapp", "number", "target"]);

    if (!text || !sender) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const normalizedText = text.trim();
    const isOptOut = OPT_OUT_RE.test(normalizedText);
    const isOptIn = OPT_IN_RE.test(normalizedText);
    if (!isOptOut && !isOptIn) {
      return NextResponse.json({ ok: true, optedIn: false, optedOut: false });
    }

    const leadIds = await findLeadIdsBySender(sender);

    if (leadIds.length === 0) {
      return NextResponse.json({ ok: true, optedIn: false, optedOut: false, reason: "lead_not_found" });
    }

    if (isOptOut) {
      await prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: {
          waOptInStatus:  "OPTED_OUT",
          waOptOutAt:     new Date(),
          waOptOutReason: normalizedText.slice(0, 100),
          doNotContact:   true,
        },
      });

      return NextResponse.json({ ok: true, optedOut: true, count: leadIds.length });
    }

    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: {
        waOptInStatus:  "OPTED_IN",
        waOptInAt:      new Date(),
        waOptInSource:  "fonnte_webhook",
        waOptOutAt:     null,
        waOptOutReason: null,
        doNotContact:   false,
      },
    });

    return NextResponse.json({ ok: true, optedIn: true, count: leadIds.length });
  } catch (err) {
    console.error("[Fonnte Inbound Webhook]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
