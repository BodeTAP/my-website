import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { fonnteGetDevices, fonnteAddDevice } from "@/lib/fonnte";

function getAccountToken(): string | null {
  return process.env.FONNTE_ACCOUNT_TOKEN ?? null;
}

// GET /api/admin/fonnte/devices — list all devices
export async function GET() {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;

  const token = getAccountToken();
  if (!token) {
    return NextResponse.json({ error: "FONNTE_ACCOUNT_TOKEN belum dikonfigurasi di environment." }, { status: 503 });
  }

  const result = await fonnteGetDevices(token);
  if (!result.status) {
    return NextResponse.json({ error: result.reason ?? "Gagal mengambil data device." }, { status: 400 });
  }

  return NextResponse.json(result);
}

// POST /api/admin/fonnte/devices — add new device
export async function POST(req: Request) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;

  const token = getAccountToken();
  if (!token) {
    return NextResponse.json({ error: "FONNTE_ACCOUNT_TOKEN belum dikonfigurasi di environment." }, { status: 503 });
  }

  const { name, device, autoread, personal, group } = await req.json();
  if (!name?.trim() || !device?.trim()) {
    return NextResponse.json({ error: "Nama dan nomor device wajib diisi." }, { status: 400 });
  }

  const result = await fonnteAddDevice(token, { name, device, autoread, personal, group });
  if (!result.status) {
    return NextResponse.json({ error: result.reason ?? "Gagal menambahkan device." }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
