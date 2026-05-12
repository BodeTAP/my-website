import { NextResponse, after } from "next/server";
import { auth } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sendWA, waMsg } from "@/lib/whatsapp";
import { getSiteSettings, renderSettingTemplate } from "@/lib/siteSettings";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const s = await auth();
  return !s || (s.user as { role?: string })?.role !== "ADMIN";
}

export async function PATCH(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("maintenance");
  if (denied) return denied;
  const { id } = await params;
  const { status, notes } = await req.json();

  const sub = await prisma.subscription.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
    include: {
      client: { select: { businessName: true, user: { select: { name: true } } } },
      package: { select: { name: true, price: true } },
    },
  });
  return NextResponse.json(sub);
}

/** Generate monthly invoice for this subscription */
export async function POST(req: Request, { params }: Params) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("maintenance");
  if (denied) return denied;
  const { id } = await params;

  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: {
      package: true,
      client: { include: { user: { select: { name: true, email: true } } } },
    },
  });
  if (!sub) return NextResponse.json({ error: "Subscription tidak ditemukan." }, { status: 404 });
  if (sub.status !== "ACTIVE") return NextResponse.json({ error: "Subscription tidak aktif." }, { status: 400 });

  // Auto-generate invoice number
  const settings = await getSiteSettings();
  const month = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());
  const count = await prisma.invoice.count();
  const invoiceNo = `${settings.invoice_prefix || "MNT"}-${String(count + 1).padStart(4, "0")}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number.parseInt(settings.invoice_valid_days || "7", 10));

  const invoice = await prisma.invoice.create({
    data: {
      clientId: sub.clientId,
      invoiceNo,
      description: `Biaya Maintenance ${sub.package.name} — ${month}`,
      amount: sub.package.price,
      dueDate,
      status: "UNPAID",
    },
    include: { client: { include: { user: { select: { name: true, email: true } } } } },
  });

  // Advance nextBillingDate by 1 month
  const next = new Date(sub.nextBillingDate);
  next.setMonth(next.getMonth() + 1);
  await prisma.subscription.update({ where: { id }, data: { nextBillingDate: next } });

  // WA notification to client (fire-and-forget after response)
  after(async () => {
    const phone = sub.client.phone;
    const clientName = sub.client.user.name ?? sub.client.businessName;
    if (phone) {
      const paymentUrl = `${settings.brand_site_url}/bayar/${invoiceNo}`;
      const message = settings.template_wa_maintenance_billing
        ? renderSettingTemplate(settings.template_wa_maintenance_billing, {
            brandName: settings.brand_name,
            clientName,
            invoiceNo,
            amount: `Rp ${sub.package.price.toLocaleString("id-ID")}`,
            dueDate: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(dueDate),
            paymentUrl,
            packageName: sub.package.name,
          })
        : waMsg.invoiceNew(clientName, invoiceNo, sub.package.price, dueDate, paymentUrl);
      await sendWA(phone, message).catch((e) =>
        console.error("[WA] maintenance invoice:", e),
      );
    }
  });

  return NextResponse.json({ invoice, nextBillingDate: next }, { status: 201 });
}
