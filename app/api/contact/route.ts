import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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
