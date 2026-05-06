import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    teamRole: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teamRolePermission: {
      deleteMany: vi.fn(),
    },
    adminPermission: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    permissionAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
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
import { isSuperAdmin, VALID_MODULES } from "@/lib/permissions";
import { logPermissionChange } from "@/lib/audit";
import { GET as getRoles, POST as postRole } from "@/app/api/admin/team/roles/route";
import { PUT as putRole, DELETE as deleteRole } from "@/app/api/admin/team/roles/[id]/route";
import { POST as deleteWithReassign } from "@/app/api/admin/team/roles/[id]/delete-with-reassign/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUPER_ADMIN_ID = "super-admin-id";

function mockSuperAdminSession() {
  vi.mocked(auth).mockResolvedValue({
    user: { id: SUPER_ADMIN_ID, email: "super@test.com", name: "Super" },
    expires: new Date(Date.now() + 3_600_000).toISOString(),
  } as never);
  vi.mocked(isSuperAdmin).mockResolvedValue(true);
}

function mockNonSuperAdminSession() {
  vi.mocked(auth).mockResolvedValue({
    user: { id: "regular-admin-id", email: "admin@test.com", name: "Admin" },
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

// ─── Property 5: Validasi modul menolak input invalid ────────────────────────
// Feature: team-permissions, Property 5: Validasi modul menolak input invalid
describe("Property 5: Validasi modul menolak input invalid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuperAdminSession();
    vi.mocked(logPermissionChange).mockResolvedValue(undefined);
  });

  it("POST /api/admin/team/roles menolak modul yang tidak valid dengan 400", async () => {
    // Validates: Requirements 8.2
    await fc.assert(
      fc.asyncProperty(
        // Generate a non-empty, non-whitespace-only role name
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        // Generate at least one string that is NOT in VALID_MODULES
        fc.array(
          fc.string({ minLength: 1, maxLength: 30 }).filter(
            (s) => !(VALID_MODULES as readonly string[]).includes(s)
          ),
          { minLength: 1, maxLength: 5 }
        ),
        async (name, invalidModules) => {
          vi.clearAllMocks();
          mockSuperAdminSession();

          // Mock findUnique to return null (no duplicate name)
          vi.mocked(prisma.teamRole.findUnique).mockResolvedValue(null);

          const req = makeRequest(
            "http://localhost/api/admin/team/roles",
            "POST",
            { name, modules: invalidModules }
          );

          const res = await postRole(req);
          expect(res.status).toBe(400);

          const body = await res.json();
          expect(body.error).toMatch(/Modul tidak valid/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("PUT /api/admin/team/roles/[id] menolak modul yang tidak valid dengan 400", async () => {
    // Validates: Requirements 8.2
    await fc.assert(
      fc.asyncProperty(
        // Generate at least one string that is NOT in VALID_MODULES
        fc.array(
          fc.string({ minLength: 1, maxLength: 30 }).filter(
            (s) => !(VALID_MODULES as readonly string[]).includes(s)
          ),
          { minLength: 1, maxLength: 5 }
        ),
        async (invalidModules) => {
          vi.clearAllMocks();
          mockSuperAdminSession();

          // Mock findUnique to return an existing role (so we get past the 404 check)
          vi.mocked(prisma.teamRole.findUnique).mockResolvedValue({
            id: "role-1",
            name: "Existing Role",
            createdAt: new Date(),
            updatedAt: new Date(),
            permissions: [],
          } as never);

          const req = makeRequest(
            "http://localhost/api/admin/team/roles/role-1",
            "PUT",
            { modules: invalidModules }
          );

          const res = await putRole(req, makeParamsPromise("role-1"));
          expect(res.status).toBe(400);

          const body = await res.json();
          expect(body.error).toMatch(/Modul tidak valid/);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6: Nama role bersifat unik ─────────────────────────────────────
// Feature: team-permissions, Property 6: Nama role bersifat unik
describe("Property 6: Nama role bersifat unik", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuperAdminSession();
    vi.mocked(logPermissionChange).mockResolvedValue(undefined);
  });

  it("POST /api/admin/team/roles mengembalikan 409 jika nama sudah ada", async () => {
    // Validates: Requirements 2.2
    await fc.assert(
      fc.asyncProperty(
        // Generate a non-empty role name
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        async (roleName) => {
          vi.clearAllMocks();
          mockSuperAdminSession();

          // Mock: role with this name already exists
          vi.mocked(prisma.teamRole.findUnique).mockResolvedValue({
            id: "existing-role-id",
            name: roleName.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as never);

          const req = makeRequest(
            "http://localhost/api/admin/team/roles",
            "POST",
            { name: roleName, modules: [] }
          );

          const res = await postRole(req);
          expect(res.status).toBe(409);

          const body = await res.json();
          expect(body.error).toBe("Role dengan nama ini sudah ada.");
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 7: Update modul role bersifat atomik ───────────────────────────
// Feature: team-permissions, Property 7: Update modul role bersifat atomik
describe("Property 7: Update modul role bersifat atomik", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuperAdminSession();
    vi.mocked(logPermissionChange).mockResolvedValue(undefined);
  });

  it("PUT /api/admin/team/roles/[id] menggunakan transaksi yang menghapus lama dan membuat baru", async () => {
    // Validates: Requirements 2.3
    await fc.assert(
      fc.asyncProperty(
        // Initial modules (subset of VALID_MODULES)
        fc.shuffledSubarray([...VALID_MODULES], { minLength: 0 }),
        // New modules (subset of VALID_MODULES)
        fc.shuffledSubarray([...VALID_MODULES], { minLength: 0 }),
        async (initialModules, newModules) => {
          vi.clearAllMocks();
          mockSuperAdminSession();
          vi.mocked(logPermissionChange).mockResolvedValue(undefined);

          const roleId = "role-atomic-test";

          // Track what operations happen inside the transaction
          const transactionOps: string[] = [];

          // Mock findUnique to return existing role with initial modules
          vi.mocked(prisma.teamRole.findUnique).mockResolvedValue({
            id: roleId,
            name: "Test Role",
            createdAt: new Date(),
            updatedAt: new Date(),
            permissions: initialModules.map((m) => ({ module: m })),
          } as never);

          // Mock $transaction to capture operations
          vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
            const txMock = {
              teamRolePermission: {
                deleteMany: vi.fn(async () => {
                  transactionOps.push("deleteMany");
                  return { count: initialModules.length };
                }),
              },
              teamRole: {
                update: vi.fn(async () => {
                  transactionOps.push("update");
                  return {
                    id: roleId,
                    name: "Test Role",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    permissions: newModules.map((m) => ({ module: m })),
                  };
                }),
              },
            };
            return fn(txMock as never);
          });

          const req = makeRequest(
            `http://localhost/api/admin/team/roles/${roleId}`,
            "PUT",
            { modules: newModules }
          );

          const res = await putRole(req, makeParamsPromise(roleId));

          // Should succeed
          expect(res.status).toBe(200);

          // Transaction must have been called
          expect(prisma.$transaction).toHaveBeenCalledTimes(1);

          // Both deleteMany and update must have been called inside the transaction
          expect(transactionOps).toContain("deleteMany");
          expect(transactionOps).toContain("update");

          // deleteMany must come before update (atomicity: delete old, create new)
          expect(transactionOps.indexOf("deleteMany")).toBeLessThan(
            transactionOps.indexOf("update")
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── Property 8: Hapus role dengan reassign bersifat atomik ──────────────────
// Feature: team-permissions, Property 8: Hapus role dengan reassign bersifat atomik
describe("Property 8: Hapus role dengan reassign bersifat atomik", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuperAdminSession();
    vi.mocked(logPermissionChange).mockResolvedValue(undefined);
  });

  it("POST delete-with-reassign menggunakan satu transaksi untuk reassign dan delete", async () => {
    // Validates: Requirements 4.4, 4.5
    await fc.assert(
      fc.asyncProperty(
        // Number of admins assigned to the role
        fc.integer({ min: 1, max: 10 }),
        async (adminCount) => {
          vi.clearAllMocks();
          mockSuperAdminSession();
          vi.mocked(logPermissionChange).mockResolvedValue(undefined);

          const roleId = "role-to-delete";
          const replacementRoleId = "replacement-role-id";
          const adminIds = Array.from({ length: adminCount }, (_, i) => `admin-${i}`);

          // Mock findUnique to return the role with assigned admins
          vi.mocked(prisma.teamRole.findUnique).mockResolvedValue({
            id: roleId,
            name: "Old Role",
            createdAt: new Date(),
            updatedAt: new Date(),
            adminAssignments: adminIds.map((id) => ({ adminId: id })),
            permissions: [],
          } as never);

          // Track transaction operations
          const transactionOps: string[] = [];

          vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
            const txMock = {
              adminPermission: {
                updateMany: vi.fn(async () => {
                  transactionOps.push("updateMany");
                  return { count: adminCount };
                }),
              },
              teamRole: {
                delete: vi.fn(async () => {
                  transactionOps.push("delete");
                  return { id: roleId };
                }),
              },
            };
            return fn(txMock as never);
          });

          const req = makeRequest(
            `http://localhost/api/admin/team/roles/${roleId}/delete-with-reassign`,
            "POST",
            { replacementRoleId }
          );

          const res = await deleteWithReassign(req, makeParamsPromise(roleId));

          expect(res.status).toBe(200);

          // Must use exactly one transaction
          expect(prisma.$transaction).toHaveBeenCalledTimes(1);

          // Both operations must happen inside the transaction
          expect(transactionOps).toContain("updateMany");
          expect(transactionOps).toContain("delete");

          // updateMany (reassign) must come before delete
          expect(transactionOps.indexOf("updateMany")).toBeLessThan(
            transactionOps.indexOf("delete")
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  it("POST delete-with-reassign mengembalikan 500 jika transaksi gagal", async () => {
    // Validates: Requirements 4.5
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (adminCount) => {
          vi.clearAllMocks();
          mockSuperAdminSession();
          vi.mocked(logPermissionChange).mockResolvedValue(undefined);

          const roleId = "role-to-delete";
          const replacementRoleId = "replacement-role-id";
          const adminIds = Array.from({ length: adminCount }, (_, i) => `admin-${i}`);

          vi.mocked(prisma.teamRole.findUnique).mockResolvedValue({
            id: roleId,
            name: "Old Role",
            createdAt: new Date(),
            updatedAt: new Date(),
            adminAssignments: adminIds.map((id) => ({ adminId: id })),
            permissions: [],
          } as never);

          // Simulate transaction failure
          vi.mocked(prisma.$transaction).mockRejectedValue(new Error("DB error"));

          const req = makeRequest(
            `http://localhost/api/admin/team/roles/${roleId}/delete-with-reassign`,
            "POST",
            { replacementRoleId }
          );

          const res = await deleteWithReassign(req, makeParamsPromise(roleId));

          expect(res.status).toBe(500);
          const body = await res.json();
          expect(body.error).toMatch(/Operasi gagal/);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("Non-super-admin mendapat 403 di semua endpoint role management", async () => {
    mockNonSuperAdminSession();

    const roleId = "some-role-id";

    // GET /roles
    const getRes = await getRoles();
    expect(getRes.status).toBe(403);

    // POST /roles
    const postRes = await postRole(
      makeRequest("http://localhost/api/admin/team/roles", "POST", { name: "Test", modules: [] })
    );
    expect(postRes.status).toBe(403);

    // PUT /roles/[id]
    const putRes = await putRole(
      makeRequest(`http://localhost/api/admin/team/roles/${roleId}`, "PUT", {}),
      makeParamsPromise(roleId)
    );
    expect(putRes.status).toBe(403);

    // DELETE /roles/[id]
    const deleteRes = await deleteRole(
      makeRequest(`http://localhost/api/admin/team/roles/${roleId}`, "DELETE"),
      makeParamsPromise(roleId)
    );
    expect(deleteRes.status).toBe(403);

    // POST /roles/[id]/delete-with-reassign
    const reassignRes = await deleteWithReassign(
      makeRequest(
        `http://localhost/api/admin/team/roles/${roleId}/delete-with-reassign`,
        "POST",
        { replacementRoleId: "other-id" }
      ),
      makeParamsPromise(roleId)
    );
    expect(reassignRes.status).toBe(403);
  });
});
