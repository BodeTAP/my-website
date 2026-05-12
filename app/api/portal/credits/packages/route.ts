import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSessionClient() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id };
}

export async function GET() {
  const packages = await prisma.creditPackage.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return NextResponse.json(packages);
}

export async function POST(req: NextRequest) {
  const { status, clientId } = await getSessionClient();
  if (!clientId) {
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Client not found" },
      { status },
    );
  }

  const body = await req.json().catch(() => ({}));
  const packageId = typeof body.packageId === "string" ? body.packageId : "";
  if (!packageId) return NextResponse.json({ error: "packageId wajib diisi" }, { status: 400 });

  const pkg = await prisma.creditPackage.findFirst({
    where: { id: packageId, isActive: true },
  });

  if (!pkg) return NextResponse.json({ error: "Paket kredit tidak ditemukan" }, { status: 404 });

  const invoiceNo = "PKG-" + Date.now().toString(36).toUpperCase();
  await prisma.invoice.create({
    data: {
      clientId,
      invoiceNo,
      description: `Paket Kredit ${pkg.name} - ${pkg.credits + pkg.bonusCredit} Kredit`,
      amount: pkg.price,
      lineItems: [{
        name: `Paket Kredit ${pkg.name}`,
        qty: 1,
        price: pkg.price,
        type: "credit_package",
        packageId: pkg.id,
        credits: pkg.credits,
        bonusCredit: pkg.bonusCredit,
      }],
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ invoiceNo, paymentUrl: `/bayar/${invoiceNo}` });
}
