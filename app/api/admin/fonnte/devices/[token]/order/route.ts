import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { fonnteOrderPackage } from "@/lib/fonnte";

type Params = { params: Promise<{ token: string }> };

/**
 * POST /api/admin/fonnte/devices/[token]/order
 *
 * Order a Fonnte package for a device.
 *
 * Body:
 * {
 *   plan?: number,          // 1=Lite, 2=Regular, 3=Regular Pro, 4=Master, 5=Super, 6=Advanced, 7=Ultra
 *   duration?: number,      // 1=Month, 10=Year
 *   durationValue?: number, // how many durations (e.g. 3 = 3 months)
 *   aiQuota?: number,       // min 500, step 100
 *   aiData?: number,        // additional AI data
 * }
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const body = await req.json().catch(() => ({}));

  const { plan, duration, durationValue, aiQuota, aiData } = body as {
    plan?: number;
    duration?: number;
    durationValue?: number;
    aiQuota?: number;
    aiData?: number;
  };

  // Must have at least one of: plan or aiQuota
  if (!plan && !aiQuota) {
    return NextResponse.json({ error: "Pilih paket atau AI quota yang ingin dipesan." }, { status: 400 });
  }

  // If ordering a plan, duration and durationValue are required
  if (plan && (!duration || !durationValue)) {
    return NextResponse.json({ error: "Durasi dan jumlah durasi wajib diisi untuk pemesanan paket." }, { status: 400 });
  }

  const result = await fonnteOrderPackage(decodeURIComponent(token), {
    plan,
    duration,
    durationValue,
    aiQuota,
    aiData,
  });

  if (!result.status) {
    return NextResponse.json({ error: result.reason ?? "Gagal melakukan pemesanan." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, detail: result.detail });
}
