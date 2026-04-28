import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendWA, normalizePhone } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to = req.nextUrl.searchParams.get("to");
  if (!to) {
    return NextResponse.json(
      { error: "Tambahkan ?to=628xxx pada URL" },
      { status: 400 }
    );
  }

  const hasKey   = !!process.env.FONNTE_API_KEY;
  const phone    = normalizePhone(to);
  const success  = await sendWA(to, "✅ Test pesan dari MFWEB. Integrasi WhatsApp via Fonnte berhasil!");

  return NextResponse.json({
    success,
    debug: {
      fonnte_key_set: hasKey,
      raw_input:      to,
      normalized:     phone,
    },
  });
}
