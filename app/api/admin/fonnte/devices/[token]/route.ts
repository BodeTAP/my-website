import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { fonnteGetDeviceProfile, fonnteDisconnectDevice, fonnteGetQR } from "@/lib/fonnte";

type Params = { params: Promise<{ token: string }> };

// GET /api/admin/fonnte/devices/[token] — device profile
export async function GET(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const result = await fonnteGetDeviceProfile(decodeURIComponent(token));
  if (!result.status) {
    return NextResponse.json({ error: "Token tidak valid atau device tidak ditemukan." }, { status: 400 });
  }

  return NextResponse.json(result);
}

// DELETE /api/admin/fonnte/devices/[token] — disconnect device
export async function DELETE(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const result = await fonnteDisconnectDevice(decodeURIComponent(token));
  if (!result.status) {
    return NextResponse.json({ error: result.detail ?? "Gagal disconnect device." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, detail: result.detail });
}

// POST /api/admin/fonnte/devices/[token]/qr — get QR or pairing code
export async function POST(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const body = await req.json().catch(() => ({}));
  const type = body.type === "code" ? "code" : "qr";
  const whatsapp = body.whatsapp;

  const result = await fonnteGetQR(decodeURIComponent(token), type, whatsapp);
  return NextResponse.json(result);
}
