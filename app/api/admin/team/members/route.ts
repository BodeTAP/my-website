import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";

// ─── Guard helper ─────────────────────────────────────────────────────────────

async function guardSuperAdmin(): Promise<{ userId: string } | NextResponse> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }
  const superAdmin = await isSuperAdmin(userId);
  if (!superAdmin) {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }
  return { userId };
}

// ─── 7.1 GET /api/admin/team/members ─────────────────────────────────────────

export async function GET() {
  const guard = await guardSuperAdmin();
  if (guard instanceof NextResponse) return guard;

  const users = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    include: {
      adminPermission: {
        include: {
          role: true,
        },
      },
    },
  });

  const members = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    isSuperAdmin: user.adminPermission?.isSuperAdmin ?? false,
    roleId: user.adminPermission?.roleId ?? null,
    roleName: user.adminPermission?.role?.name ?? null,
  }));

  return NextResponse.json(members);
}
