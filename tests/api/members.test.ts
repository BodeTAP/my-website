import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
    adminPermission: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    permissionAuditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/permissions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/permissions")>();
  return {
    ...actual,
    isSuperAdmin: vi.fn(),
  };
});

vi.mock("@/lib/audit", () => ({
  logPermissionChange: vi.fn(),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { logPermissionChange } from "@/lib/audit";
import { GET as getMembers } from "@/app/api/admin/team/members/route";
import { PATCH as patchMemberRole } from "@/app/api/admin/team/members/[id]/role/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUPER_ADMIN_ID = "super-admin-id";
const REGULAR_ADMIN_ID = "regular-admin-id";
const TARGET_ADMIN_ID = "target-admin-id";

function mockSuperAdminSession(id = SUPER_ADMIN_ID) {
  vi.mocked(auth).mockResolvedValue({
    user: { id, email: "super@test.com", name: "Super" },
    expires: new Date(Date.now() + 3_600_000).toISOString(),
  } as never);
  vi.mocked(isSuperAdmin).mockImplementation(async (adminId: string) => {
    return adminId === id;
  });
}

function mockNonSuperAdminSession() {
  vi.mocked(auth).mockResolvedValue({
    user: { id: REGULAR_ADMIN_ID, email: "admin@test.com", name: "Admin" },
    expires: new Date(Date.now() + 3_600_000).toISOString(),
  } as never);
  vi.mocked(isSuperAdmin).mockResolvedValue(false);
}

function makeRequest(
  url: string,
  method: string,
  body?: Record<string, unknown>
): Request {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function makeParamsPromise(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

// ─── Basic tests: GET /api/admin/team/members ─────────────────────────────────

describe("GET /api/admin/team/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("non-super-admin mendapat 403", async () => {
    mockNonSuperAdminSession();

    const res = await getMembers();
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toBe("Forbidden: Super Admin only");
  });

  it("super-admin mendapat daftar members dengan 200", async () => {
    mockSuperAdminSession();

    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: "admin-1",
        name: "Admin One",
        email: "admin1@test.com",
        role: "ADMIN",
        adminPermission: {
          id: "perm-1",
          adminId: "admin-1",
          isSuperAdmin: true,
          roleId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          role: null,
        },
      },
      {
        id: "admin-2",
        name: "Admin Two",
        email: "admin2@test.com",
        role: "ADMIN",
        adminPermission: {
          id: "perm-2",
          adminId: "admin-2",
          isSuperAdmin: false,
          roleId: "role-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          role: { id: "role-1", name: "Marketing", createdAt: new Date(), updatedAt: new Date() },
        },
      },
    ] as never);

    const res = await getMembers();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({
      id: "admin-1",
      name: "Admin One",
      email: "admin1@test.com",
      isSuperAdmin: true,
      roleId: null,
      roleName: null,
    });
    expect(body[1]).toMatchObject({
      id: "admin-2",
      name: "Admin Two",
      email: "admin2@test.com",
      isSuperAdmin: false,
      roleId: "role-1",
      roleName: "Marketing",
    });
  });
});

// ─── Basic tests: PATCH /api/admin/team/members/[id]/role ─────────────────────

describe("PATCH /api/admin/team/members/[id]/role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logPermissionChange).mockResolvedValue(undefined);
  });

  it("non-super-admin mendapat 403", async () => {
    mockNonSuperAdminSession();

    const req = makeRequest(
      `http://localhost/api/admin/team/members/${TARGET_ADMIN_ID}/role`,
      "PATCH",
      { roleId: "some-role-id" }
    );

    const res = await patchMemberRole(req, makeParamsPromise(TARGET_ADMIN_ID));
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toBe("Forbidden: Super Admin only");
  });

  it("assign role ke super admin mengembalikan 403", async () => {
    // Super admin requester, target is also super admin
    mockSuperAdminSession(SUPER_ADMIN_ID);
    // isSuperAdmin returns true for both requester and target
    vi.mocked(isSuperAdmin).mockImplementation(async (adminId: string) => {
      return adminId === SUPER_ADMIN_ID || adminId === TARGET_ADMIN_ID;
    });

    const req = makeRequest(
      `http://localhost/api/admin/team/members/${TARGET_ADMIN_ID}/role`,
      "PATCH",
      { roleId: "some-role-id" }
    );

    const res = await patchMemberRole(req, makeParamsPromise(TARGET_ADMIN_ID));
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toBe("Tidak dapat mengubah assignment role Super Admin.");
  });

  it("mengubah role diri sendiri mengembalikan 403", async () => {
    mockSuperAdminSession(SUPER_ADMIN_ID);

    const req = makeRequest(
      `http://localhost/api/admin/team/members/${SUPER_ADMIN_ID}/role`,
      "PATCH",
      { roleId: "some-role-id" }
    );

    // Target ID is same as requester ID
    const res = await patchMemberRole(req, makeParamsPromise(SUPER_ADMIN_ID));
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.error).toBe("Tidak dapat mengubah role diri sendiri.");
  });

  it("assign role berhasil mengembalikan 200", async () => {
    mockSuperAdminSession(SUPER_ADMIN_ID);

    const roleId = "role-marketing";

    vi.mocked(prisma.adminPermission.findUnique).mockResolvedValue({
      id: "perm-1",
      adminId: TARGET_ADMIN_ID,
      roleId: null,
      isSuperAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    vi.mocked(prisma.adminPermission.upsert).mockResolvedValue({
      id: "perm-1",
      adminId: TARGET_ADMIN_ID,
      roleId,
      isSuperAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const req = makeRequest(
      `http://localhost/api/admin/team/members/${TARGET_ADMIN_ID}/role`,
      "PATCH",
      { roleId }
    );

    const res = await patchMemberRole(req, makeParamsPromise(TARGET_ADMIN_ID));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.roleId).toBe(roleId);

    expect(logPermissionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ROLE_ASSIGNED",
        targetAdminId: TARGET_ADMIN_ID,
      })
    );
  });

  it("unassign role (roleId: null) berhasil mengembalikan 200 dengan ROLE_UNASSIGNED", async () => {
    mockSuperAdminSession(SUPER_ADMIN_ID);

    vi.mocked(prisma.adminPermission.findUnique).mockResolvedValue({
      id: "perm-1",
      adminId: TARGET_ADMIN_ID,
      roleId: "old-role-id",
      isSuperAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    vi.mocked(prisma.adminPermission.upsert).mockResolvedValue({
      id: "perm-1",
      adminId: TARGET_ADMIN_ID,
      roleId: null,
      isSuperAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const req = makeRequest(
      `http://localhost/api/admin/team/members/${TARGET_ADMIN_ID}/role`,
      "PATCH",
      { roleId: null }
    );

    const res = await patchMemberRole(req, makeParamsPromise(TARGET_ADMIN_ID));
    expect(res.status).toBe(200);

    expect(logPermissionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ROLE_UNASSIGNED",
        targetAdminId: TARGET_ADMIN_ID,
      })
    );
  });
});

// ─── Property 9: Setiap admin hanya memiliki satu role ────────────────────────
// Feature: team-permissions, Property 9: Setiap admin hanya memiliki satu role
describe("Property 9: Setiap admin hanya memiliki satu role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logPermissionChange).mockResolvedValue(undefined);
  });

  it("setiap assignment selalu menggunakan upsert dengan where: { adminId } — tidak pernah membuat duplikat", async () => {
    // Validates: Requirements 3.2
    await fc.assert(
      fc.asyncProperty(
        // Generate a sequence of role IDs (or null) to assign to the same admin
        fc.array(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
            fc.constant(null)
          ),
          { minLength: 1, maxLength: 10 }
        ),
        async (roleAssignments) => {
          vi.clearAllMocks();
          mockSuperAdminSession(SUPER_ADMIN_ID);
          vi.mocked(logPermissionChange).mockResolvedValue(undefined);

          const adminId = "test-admin-id";

          // Track all upsert calls
          const upsertCalls: Array<{ where: unknown; create: unknown; update: unknown }> = [];

          vi.mocked(prisma.adminPermission.findUnique).mockResolvedValue({
            id: "perm-1",
            adminId,
            roleId: null,
            isSuperAdmin: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as never);

          vi.mocked(prisma.adminPermission.upsert).mockImplementation((async (args: { update: { roleId: string | null } }) => {
            upsertCalls.push(args as never);
            return {
              id: "perm-1",
              adminId,
              roleId: (args as { update: { roleId: string | null } }).update.roleId,
              isSuperAdmin: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }) as never);

          // Execute each role assignment in sequence
          for (const roleId of roleAssignments) {
            const req = makeRequest(
              `http://localhost/api/admin/team/members/${adminId}/role`,
              "PATCH",
              { roleId }
            );
            await patchMemberRole(req, makeParamsPromise(adminId));
          }

          // Every upsert call must use where: { adminId } — the unique constraint
          // This ensures it always updates the single record, never creates duplicates
          for (const call of upsertCalls) {
            expect(call.where).toEqual({ adminId });
          }

          // Number of upsert calls must equal number of assignments
          expect(upsertCalls).toHaveLength(roleAssignments.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
