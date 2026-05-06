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

// ─── 6.1 GET /api/admin/team/roles ───────────────────────────────────────────

export async function GET() {
  const guard = await guardSuperAdmin();
  if (guard instanceof NextResponse) return guard;

  const roles = await prisma.teamRole.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          permissions: true,
          adminAssignments: true,
        },
      },
    },
  });

  return NextResponse.json(roles);
}

// ─── 6.2 POST /api/admin/team/roles ──────────────────────────────────────────

export async function POST(req: Request) {
  const guard = await guardSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { userId } = guard;

  const body = await req.json();
  const { name, modules } = body as { name?: string; modules?: string[] };

  // Validate name
  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Nama role tidak boleh kosong." }, { status: 400 });
  }

  // Validate modules
  const invalidModules = (modules ?? []).filter(
    (m) => !(VALID_MODULES as readonly string[]).includes(m)
  );
  if (invalidModules.length > 0) {
    return NextResponse.json(
      { error: `Modul tidak valid: ${invalidModules.join(", ")}` },
      { status: 400 }
    );
  }

  // Check duplicate name
  const existing = await prisma.teamRole.findUnique({ where: { name: name.trim() } });
  if (existing) {
    return NextResponse.json({ error: "Role dengan nama ini sudah ada." }, { status: 409 });
  }

  // Create role + permissions in one transaction
  const role = await prisma.$transaction(async (tx) => {
    return tx.teamRole.create({
      data: {
        name: name.trim(),
        permissions: {
          create: (modules ?? []).map((m) => ({ module: m })),
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            permissions: true,
            adminAssignments: true,
          },
        },
      },
    });
  });

  // Audit log
  await logPermissionChange({
    changedBy: userId,
    targetRoleId: role.id,
    action: "ROLE_CREATED",
    before: {},
    after: { name: role.name, modules: modules ?? [] },
  });

  return NextResponse.json(role, { status: 201 });
}
