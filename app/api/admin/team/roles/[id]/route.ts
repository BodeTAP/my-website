import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin, VALID_MODULES } from "@/lib/permissions";
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

// ─── 6.5 GET /api/admin/team/roles/[id] ──────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardSuperAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;

  const role = await prisma.teamRole.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      permissions: {
        select: { module: true },
      },
    },
  });

  if (!role) {
    return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    id: role.id,
    name: role.name,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    modules: role.permissions.map((p) => p.module),
  });
}

// ─── 6.6 PUT /api/admin/team/roles/[id] ──────────────────────────────────────

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { userId } = guard;

  const { id } = await params;

  const body = await req.json();
  const { name, modules } = body as { name?: string; modules?: string[] };

  // Validate modules if provided
  if (modules !== undefined) {
    const invalidModules = modules.filter(
      (m) => !(VALID_MODULES as readonly string[]).includes(m)
    );
    if (invalidModules.length > 0) {
      return NextResponse.json(
        { error: `Modul tidak valid: ${invalidModules.join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Fetch existing role
  const existingRole = await prisma.teamRole.findUnique({
    where: { id },
    include: { permissions: { select: { module: true } } },
  });

  if (!existingRole) {
    return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
  }

  // Check duplicate name if name is being changed
  if (name !== undefined && name.trim() !== existingRole.name) {
    const duplicate = await prisma.teamRole.findUnique({ where: { name: name.trim() } });
    if (duplicate) {
      return NextResponse.json({ error: "Role dengan nama ini sudah ada." }, { status: 409 });
    }
  }

  const before = {
    name: existingRole.name,
    modules: existingRole.permissions.map((p) => p.module),
  };

  // Atomically replace permissions
  const updatedRole = await prisma.$transaction(async (tx) => {
    // Delete all old permissions if modules are being updated
    if (modules !== undefined) {
      await tx.teamRolePermission.deleteMany({ where: { roleId: id } });
    }

    return tx.teamRole.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(modules !== undefined
          ? {
              permissions: {
                create: modules.map((m) => ({ module: m })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: { module: true },
        },
      },
    });
  });

  const after = {
    name: updatedRole.name,
    modules: updatedRole.permissions.map((p) => p.module),
  };

  // Audit log
  await logPermissionChange({
    changedBy: userId,
    targetRoleId: id,
    action: "ROLE_UPDATED",
    before,
    after,
  });

  return NextResponse.json({
    id: updatedRole.id,
    name: updatedRole.name,
    createdAt: updatedRole.createdAt,
    updatedAt: updatedRole.updatedAt,
    modules: updatedRole.permissions.map((p) => p.module),
  });
}

// ─── 6.8 DELETE /api/admin/team/roles/[id] ───────────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { userId } = guard;

  const { id } = await params;

  // Fetch role with admin count
  const role = await prisma.teamRole.findUnique({
    where: { id },
    include: {
      _count: { select: { adminAssignments: true } },
      permissions: { select: { module: true } },
    },
  });

  if (!role) {
    return NextResponse.json({ error: "Role tidak ditemukan." }, { status: 404 });
  }

  const adminCount = role._count.adminAssignments;
  if (adminCount > 0) {
    return NextResponse.json(
      { error: `Role masih digunakan oleh ${adminCount} admin.`, count: adminCount },
      { status: 409 }
    );
  }

  // Delete role (cascade to TeamRolePermission)
  await prisma.teamRole.delete({ where: { id } });

  // Audit log
  await logPermissionChange({
    changedBy: userId,
    targetRoleId: id,
    action: "ROLE_DELETED",
    before: { name: role.name, modules: role.permissions.map((p) => p.module) },
    after: {},
  });

  return NextResponse.json({ success: true });
}
