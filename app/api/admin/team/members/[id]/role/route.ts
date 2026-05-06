import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";
import { logPermissionChange } from "@/lib/audit";

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

// ─── 7.2 PATCH /api/admin/team/members/[id]/role ─────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { userId } = guard;

  const { id } = await params;

  // Reject if requester is trying to change their own role
  if (id === userId) {
    return NextResponse.json(
      { error: "Tidak dapat mengubah role diri sendiri." },
      { status: 403 }
    );
  }

  // Check if target admin is a Super Admin
  const targetIsSuperAdmin = await isSuperAdmin(id);
  if (targetIsSuperAdmin) {
    return NextResponse.json(
      { error: "Tidak dapat mengubah assignment role Super Admin." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { roleId } = body as { roleId: string | null };

  // Fetch existing AdminPermission for before state
  const existing = await prisma.adminPermission.findUnique({
    where: { adminId: id },
    select: { roleId: true },
  });

  const before = { roleId: existing?.roleId ?? null };

  // Upsert AdminPermission — ensures exactly one record per admin
  const updated = await prisma.adminPermission.upsert({
    where: { adminId: id },
    create: {
      adminId: id,
      roleId: roleId ?? null,
    },
    update: {
      roleId: roleId ?? null,
    },
  });

  const after = { roleId: updated.roleId };

  // Audit log
  await logPermissionChange({
    changedBy: userId,
    targetAdminId: id,
    action: roleId !== null ? "ROLE_ASSIGNED" : "ROLE_UNASSIGNED",
    before,
    after,
  });

  return NextResponse.json(updated);
}
