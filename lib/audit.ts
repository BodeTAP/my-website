import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logPermissionChange(params: {
  changedBy: string;
  targetAdminId?: string;
  targetRoleId?: string;
  action:
    | "ROLE_CREATED"
    | "ROLE_UPDATED"
    | "ROLE_DELETED"
    | "ROLE_ASSIGNED"
    | "ROLE_UNASSIGNED"
    | "ADMIN_REASSIGNED";
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}): Promise<void> {
  await prisma.permissionAuditLog.create({
    data: {
      changedBy: params.changedBy,
      targetAdminId: params.targetAdminId,
      targetRoleId: params.targetRoleId,
      action: params.action,
      before: params.before as Prisma.InputJsonValue,
      after: params.after as Prisma.InputJsonValue,
    },
  });
}
