import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { fonnteDeleteDevice } from "@/lib/fonnte";

type Params = { params: Promise<{ token: string }> };

// POST /api/admin/fonnte/devices/[token]/delete — permanently delete device from account
export async function POST(_req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const result = await fonnteDeleteDevice(decodeURIComponent(token));

  if (!result.status) {
    return NextResponse.json({ error: result.reason ?? "Gagal menghapus device." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, detail: result.detail });
}
