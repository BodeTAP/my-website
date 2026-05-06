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

// ─── 6.9 POST /api/admin/team/roles/[id]/delete-with-reassign ────────────────

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { userId } = guard;

  const { id } = await params;

  const body = await req.json();
  const { replacementRoleId } = body as { replacementRoleId?: string };

  if (!replacementRoleId) {
    return NextResponse.json({ error: "replacementRoleId wajib diisi." }, { status: 400 });
  }

  // Fetch the role to be deleted and its assigned admins
  const roleToDelete = await prisma.teamRole.findUnique({
    where: { id },
    include: {
      adminAssignments: { select: { adminId: true } },
      permissions: { select: { module: true } },
    },
  });

  if (!roleToDelete) {
    return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
  }

  const affectedAdminIds = roleToDelete.adminAssignments.map((a) => a.adminId);

  try {
    // Atomic transaction: reassign all admins + delete role
    await prisma.$transaction(async (tx) => {
      // 1. Reassign all AdminPermission records to the replacement role
      await tx.adminPermission.updateMany({
        where: { roleId: id },
        data: { roleId: replacementRoleId },
      });

      // 2. Delete the old role (cascade to TeamRolePermission)
      await tx.teamRole.delete({ where: { id } });
    });
  } catch {
    return NextResponse.json(
      { error: "Operasi gagal. Semua perubahan telah dibatalkan." },
      { status: 500 }
    );
  }

  // Audit logs (outside transaction — best effort after success)
  for (const adminId of affectedAdminIds) {
    await logPermissionChange({
      changedBy: userId,
      targetAdminId: adminId,
      targetRoleId: id,
      action: "ADMIN_REASSIGNED",
      before: { roleId: id },
      after: { roleId: replacementRoleId },
    });
  }

  await logPermissionChange({
    changedBy: userId,
    targetRoleId: id,
    action: "ROLE_DELETED",
    before: { name: roleToDelete.name, modules: roleToDelete.permissions.map((p) => p.module) },
    after: {},
  });

  return NextResponse.json({ success: true });
}
