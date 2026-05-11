import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { fonnteValidateNumbers } from "@/lib/fonnte";
import { getFonnteKey } from "@/lib/getFonnteKey";

// POST /api/admin/fonnte/validate — validate WA numbers
export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("ai_settings");
  if (denied) return denied;

  const { numbers } = await req.json() as { numbers: string[] };
  if (!numbers?.length) {
    return NextResponse.json({ error: "Nomor tidak boleh kosong." }, { status: 400 });
  }
  if (numbers.length > 500) {
    return NextResponse.json({ error: "Maksimal 500 nomor sekaligus." }, { status: 400 });
  }

  const deviceToken = await getFonnteKey();
  if (!deviceToken) {
    return NextResponse.json({ error: "Fonnte API key belum dikonfigurasi." }, { status: 503 });
  }

  const result = await fonnteValidateNumbers(deviceToken, numbers);
  if (!result.status) {
    return NextResponse.json({ error: "Gagal memvalidasi nomor." }, { status: 400 });
  }

  return NextResponse.json(result);
}
