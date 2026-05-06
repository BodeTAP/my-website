import { requireModule } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeamSettingsClient from "./TeamSettingsClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    permissions: number;
    adminAssignments: number;
  };
}

export interface MemberItem {
  id: string;
  name: string | null;
  email: string;
  isSuperAdmin: boolean;
  roleId: string | null;
  roleName: string | null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TeamSettingsPage() {
  // Only Super Admin can access this page
  await requireModule("team");

  const session = await auth();
  const currentUserId = (session?.user as { id?: string })?.id ?? "";

  // Fetch roles and members in parallel directly from DB
  const [roles, users] = await Promise.all([
    prisma.teamRole.findMany({
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
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      include: {
        adminPermission: {
          include: { role: true },
        },
      },
    }),
  ]);

  const initialRoles: RoleItem[] = roles.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    _count: r._count,
  }));

  const initialMembers: MemberItem[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email ?? "",
    isSuperAdmin: u.adminPermission?.isSuperAdmin ?? false,
    roleId: u.adminPermission?.roleId ?? null,
    roleName: u.adminPermission?.role?.name ?? null,
  }));

  return (
    <TeamSettingsClient
      initialRoles={initialRoles}
      initialMembers={initialMembers}
      currentUserId={currentUserId}
    />
  );
}
