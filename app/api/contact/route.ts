import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rateLimit";
import { sendWA, waMsg } from "@/lib/whatsapp";
import { getSiteSettings, getAdminPhone } from "@/lib/siteSettings";

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const { allowed, retryAfterMs } = await rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
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

    // Basic phone validation — must contain at least 8 digits
    const digitsOnly = whatsapp.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return NextResponse.json({ error: "Nomor WhatsApp tidak valid" }, { status: 400 });
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

    after(async () => {
      const settings = await getSiteSettings();
      const adminPhone = getAdminPhone(settings);
      if (adminPhone) {
        await sendWA(
          adminPhone,
          waMsg.newLead(lead.name, lead.businessName, lead.whatsapp, lead.domain, lead.message),
        );
      }
    });

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
