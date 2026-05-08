import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      device: string;
      status: "connect" | "disconnect";
      timestamp: number;
      reason?: string;
    };

    const { device, status, timestamp, reason } = body;

    if (!device || !status) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    // Store device status in site_settings for dashboard display
    const key = `fonnte_device_status_${device.replace(/\D/g, "")}`;
    await prisma.siteSetting.upsert({
      where: { key },
      create: {
        key,
        value: JSON.stringify({
          device,
          status,
          timestamp,
          reason: reason ?? null,
          updatedAt: new Date().toISOString(),
        }),
      },
      update: {
        value: JSON.stringify({
          device,
          status,
          timestamp,
          reason: reason ?? null,
          updatedAt: new Date().toISOString(),
        }),
      },
    });

    // Log for monitoring
    console.log(
      `[Fonnte Webhook] Device ${device}: ${status}` +
      (reason ? ` (reason: ${reason})` : "") +
      ` at ${new Date(timestamp * 1000).toISOString()}`,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fonnte Webhook] Error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
