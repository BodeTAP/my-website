import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { allowed, retryAfterMs } = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi dalam beberapa saat." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { name, businessName, whatsapp, domain, currentWebsite, message } = body;

    if (!name || !businessName || !whatsapp) {
      return NextResponse.json({ error: "Nama, nama bisnis, dan WhatsApp wajib diisi" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        businessName: businessName.trim(),
        whatsapp: whatsapp.trim(),
        domain: domain?.trim() || null,
        currentWebsite: currentWebsite?.trim() || null,
        message: message?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
