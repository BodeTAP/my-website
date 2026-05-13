import "server-only";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── 3.1 Constants & Types ────────────────────────────────────────────────────

export const VALID_MODULES = [
  "articles",
  "leads",
  "broadcast",
  "clients",
  "projects",
  "invoices",
  "proposals",
  "tickets",
  "portfolio",
  "testimonials",
  "hosting",
  "maintenance",
  "ai_settings",
  "analytics",
  "team",
] as const;

export type AdminModule = (typeof VALID_MODULES)[number];

export interface PermissionRecord {
  isSuperAdmin: boolean;
  roleId: string | null;
  modules: AdminModule[];
}

export const ROUTE_MODULE_MAP: Record<string, AdminModule> = {
  "/admin/articles": "articles",
  "/admin/leads": "leads",
  "/admin/broadcast": "broadcast",
  "/admin/clients": "clients",
  "/admin/projects": "projects",
  "/admin/invoices": "invoices",
  "/admin/proposals": "proposals",
  "/admin/proposal-templates": "proposals",
  "/admin/tools": "proposals",
  "/admin/tickets": "tickets",
  "/admin/portfolio": "portfolio",
  "/admin/testimonials": "testimonials",
  "/admin/hosting": "hosting",
  "/admin/maintenance": "maintenance",
  "/admin/settings/ai": "ai_settings",
  "/admin/analytics": "analytics",
  "/admin/settings/team": "team",
};

// ─── 3.2 isSuperAdmin ─────────────────────────────────────────────────────────

/**
 * Returns true if the given adminId is a Super Admin.
 *
 * Primary check: admin_permissions.isSuperAdmin === true.
 * Fallback: if no record with isSuperAdmin=true exists, the admin with the
 * earliest createdAt in the users table is treated as Super Admin.
 */
export async function isSuperAdmin(adminId: string): Promise<boolean> {
  // Primary: explicit flag
  const record = await prisma.adminPermission.findUnique({
    where: { adminId },
    select: { isSuperAdmin: true },
  });

  if (record?.isSuperAdmin === true) {
    return true;
  }

  // Check if ANY super admin exists in the system
  const anySuperAdmin = await prisma.adminPermission.findFirst({
    where: { isSuperAdmin: true },
    select: { adminId: true },
  });

  if (anySuperAdmin) {
    // There is an explicit super admin, and it's not this user
    return false;
  }

  // Fallback: no explicit super admin — treat earliest admin as super admin
  const earliestAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return earliestAdmin?.id === adminId;
}

// ─── 3.3 checkPermission ──────────────────────────────────────────────────────

/**
 * Returns true if the given adminId has permission to access the given module.
 *
 * Super Admins always have access.
 * Admins without a role (roleId null) never have access.
 * Otherwise, checks team_role_permissions for the assigned role.
 */
export async function checkPermission(
  adminId: string,
  module: AdminModule
): Promise<boolean> {
  // Super Admin always allowed
  if (await isSuperAdmin(adminId)) {
    return true;
  }

  // Fetch the admin's permission record with role permissions
  const record = await prisma.adminPermission.findUnique({
    where: { adminId },
    select: {
      roleId: true,
      role: {
        select: {
          permissions: {
            select: { module: true },
          },
        },
      },
    },
  });

  // No record or no role assigned → no access
  if (!record || !record.roleId || !record.role) {
    return false;
  }

  // Check if the module is in the role's permissions
  return record.role.permissions.some((p) => p.module === module);
}

// ─── 3.5 getAdminModules ──────────────────────────────────────────────────────

/**
 * Returns the list of modules the given adminId has access to.
 *
 * Super Admins get all modules.
 * Admins without a role get an empty array.
 * Otherwise, returns the modules from the assigned role.
 */
export async function getAdminModules(adminId: string): Promise<AdminModule[]> {
  if (await isSuperAdmin(adminId)) {
    return [...VALID_MODULES];
  }

  const record = await prisma.adminPermission.findUnique({
    where: { adminId },
    select: {
      roleId: true,
      role: {
        select: {
          permissions: {
            select: { module: true },
          },
        },
      },
    },
  });

  if (!record || !record.roleId || !record.role) {
    return [];
  }

  // Filter to only valid modules (defensive)
  return record.role.permissions
    .map((p) => p.module)
    .filter((m): m is AdminModule =>
      (VALID_MODULES as readonly string[]).includes(m)
    );
}

// ─── 3.7 getPermissionRecord ──────────────────────────────────────────────────

/**
 * Returns the full permission record for the given adminId.
 */
export async function getPermissionRecord(
  adminId: string
): Promise<PermissionRecord> {
  const superAdmin = await isSuperAdmin(adminId);

  const record = await prisma.adminPermission.findUnique({
    where: { adminId },
    select: {
      roleId: true,
      role: {
        select: {
          permissions: {
            select: { module: true },
          },
        },
      },
    },
  });

  if (superAdmin) {
    return {
      isSuperAdmin: true,
      roleId: record?.roleId ?? null,
      modules: [...VALID_MODULES],
    };
  }

  if (!record || !record.roleId || !record.role) {
    return {
      isSuperAdmin: false,
      roleId: record?.roleId ?? null,
      modules: [],
    };
  }

  const modules = record.role.permissions
    .map((p) => p.module)
    .filter((m): m is AdminModule =>
      (VALID_MODULES as readonly string[]).includes(m)
    );

  return {
    isSuperAdmin: false,
    roleId: record.roleId,
    modules,
  };
}

// ─── 3.8 requireModule — page guard ──────────────────────────────────────────

/**
 * Page-level guard. Call at the top of a Server Component page.
 *
 * - Fetches the current session via auth().
 * - For the "team" module: only Super Admins are allowed.
 * - For all other modules: checks checkPermission.
 * - Redirects to /admin?denied=1 if access is denied.
 */
export async function requireModule(module: AdminModule): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/admin?denied=1");
  }

  // "team" module is Super Admin only
  if (module === "team") {
    const superAdmin = await isSuperAdmin(userId);
    if (!superAdmin) {
      redirect("/admin?denied=1");
    }
    return;
  }

  const allowed = await checkPermission(userId, module);
  if (!allowed) {
    redirect("/admin?denied=1");
  }
}

// ─── 3.9 requireApiPermission — API guard ────────────────────────────────────

/**
 * API-level guard. Call at the top of a Route Handler.
 *
 * Returns null if access is allowed, or a 403 NextResponse if denied.
 */
export async function requireApiPermission(
  module: AdminModule
): Promise<NextResponse | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }

  const allowed = await checkPermission(userId, module);
  if (!allowed) {
    return NextResponse.json(
      { error: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }

  return null;
}
