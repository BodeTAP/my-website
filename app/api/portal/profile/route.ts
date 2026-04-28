import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    name:         user.name,
    email:        user.email,
    image:        user.image,
    businessName: user.client?.businessName ?? "",
    phone:        user.client?.phone ?? "",
    address:      user.client?.address ?? "",
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, businessName, phone, address } = await req.json();

  await Promise.all([
    prisma.user.update({
      where: { id: user.id },
      data: { name: name?.trim() || user.name },
    }),
    user.client
      ? prisma.client.update({
          where: { userId: user.id },
          data: {
            businessName: businessName?.trim() || user.client.businessName,
            phone:        phone?.trim() || null,
            address:      address?.trim() || null,
          },
        })
      : Promise.resolve(),
  ]);

  return NextResponse.json({ ok: true });
}
