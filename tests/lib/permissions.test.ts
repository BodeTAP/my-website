import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock next/navigation redirect (throws NEXT_REDIRECT, which we catch in tests)
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { url, digest: "NEXT_REDIRECT" });
  }),
}));

// Mock next/server NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: ResponseInit) => ({ body, status: init?.status ?? 200 })),
  },
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    adminPermission: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  VALID_MODULES,
  checkPermission,
  getAdminModules,
  requireApiPermission,
} from "@/lib/permissions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const adminPermission = vi.mocked(prisma.adminPermission);
const userMock = vi.mocked(prisma.user);
const authMock = vi.mocked(auth);

/**
 * Sets up prisma mocks so that `adminId` is a Super Admin.
 */
function mockSuperAdmin(adminId: string) {
  adminPermission.findUnique.mockImplementation((async ({ where }: { where: { adminId?: string } }) => {
    if (where.adminId === adminId) {
      return { isSuperAdmin: true, roleId: null, role: null };
    }
    return null;
  }) as never);
  // findFirst for "any super admin" check — return the super admin record
  adminPermission.findFirst.mockResolvedValue({ adminId, isSuperAdmin: true } as never);
  userMock.findFirst.mockResolvedValue(null);
}

/**
 * Sets up prisma mocks so that `adminId` has no role and is NOT a super admin.
 * `otherAdminId` is used as the "earliest admin" fallback (different from adminId).
 */
function mockNoRole(adminId: string, otherAdminId: string) {
  adminPermission.findUnique.mockImplementation((async ({ where }: { where: { adminId?: string } }) => {
    if (where.adminId === adminId) {
      return { isSuperAdmin: false, roleId: null, role: null };
    }
    return null;
  }) as never);
  // No explicit super admin in the system
  adminPermission.findFirst.mockResolvedValue(null);
  // Earliest admin is a different user (not adminId)
  userMock.findFirst.mockResolvedValue({ id: otherAdminId } as never);
}

/**
 * Sets up prisma mocks so that `adminId` has a role with the given modules.
 */
function mockWithRole(adminId: string, roleId: string, modules: string[]) {
  const permissions = modules.map((m) => ({ module: m }));
  adminPermission.findUnique.mockImplementation((async ({ where }: { where: { adminId?: string } }) => {
    if (where.adminId === adminId) {
      return { isSuperAdmin: false, roleId, role: { permissions } };
    }
    return null;
  }) as never);
  // There IS an explicit super admin (different user), so fallback won't trigger
  adminPermission.findFirst.mockResolvedValue({ adminId: "super-admin-id", isSuperAdmin: true } as never);
  userMock.findFirst.mockResolvedValue(null);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Property 2: Super Admin selalu diizinkan ─────────────────────────────────
// Feature: team-permissions, Property 2: Super Admin selalu diizinkan
describe("Property 2: Super Admin selalu diizinkan", () => {
  it("checkPermission selalu true untuk Super Admin di semua modul", async () => {
    // Validates: Requirements 1.5, 5.4, 6.4
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...VALID_MODULES),
        async (adminId, module) => {
          vi.clearAllMocks();
          mockSuperAdmin(adminId);

          const result = await checkPermission(adminId, module);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 3: Admin tanpa role tidak punya akses ───────────────────────────
// Feature: team-permissions, Property 3: Admin tanpa role tidak punya akses
describe("Property 3: Admin tanpa role tidak punya akses", () => {
  it("checkPermission selalu false untuk admin tanpa role", async () => {
    // Validates: Requirements 3.3, 5.2
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...VALID_MODULES),
        async (adminId, otherAdminId, module) => {
          // Ensure adminId and otherAdminId are different
          fc.pre(adminId !== otherAdminId);

          vi.clearAllMocks();
          mockNoRole(adminId, otherAdminId);

          const result = await checkPermission(adminId, module);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 4: Modul konsisten dengan role yang di-assign ──────────────────
// Feature: team-permissions, Property 4: Modul konsisten dengan role yang di-assign
describe("Property 4: Modul konsisten dengan role yang di-assign", () => {
  it("getAdminModules mengembalikan tepat modul yang ada di role", async () => {
    // Validates: Requirements 1.2, 3.1
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        // Generate a non-empty subset of VALID_MODULES
        fc
          .shuffledSubarray([...VALID_MODULES], { minLength: 1 })
          .map((arr) => arr as typeof VALID_MODULES[number][]),
        async (adminId, roleId, assignedModules) => {
          vi.clearAllMocks();
          mockWithRole(adminId, roleId, assignedModules);

          const result = await getAdminModules(adminId);

          // Result must contain exactly the assigned modules (order-independent)
          expect(result.sort()).toEqual([...assignedModules].sort());
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 1: Konsistensi page guard dan API guard ────────────────────────
// Feature: team-permissions, Property 1: Konsistensi page guard dan API guard
describe("Property 1: Konsistensi page guard dan API guard", () => {
  it("requireApiPermission returns 403 when checkPermission returns false", async () => {
    // Validates: Requirements 5.1, 6.1
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...VALID_MODULES),
        async (adminId, otherAdminId, module) => {
          fc.pre(adminId !== otherAdminId);

          vi.clearAllMocks();

          // Set up: admin has no role → checkPermission returns false
          mockNoRole(adminId, otherAdminId);

          // Mock auth to return a session with this adminId
          authMock.mockResolvedValue({
            user: { id: adminId, email: "test@test.com", name: "Test" },
            expires: new Date(Date.now() + 3600_000).toISOString(),
          } as never);

          // Verify checkPermission is false
          const permitted = await checkPermission(adminId, module);
          expect(permitted).toBe(false);

          // Reset mocks for requireApiPermission call (it calls prisma again internally)
          vi.clearAllMocks();
          mockNoRole(adminId, otherAdminId);
          authMock.mockResolvedValue({
            user: { id: adminId, email: "test@test.com", name: "Test" },
            expires: new Date(Date.now() + 3600_000).toISOString(),
          } as never);

          // requireApiPermission must return a 403 response (not null)
          const response = await requireApiPermission(module);
          expect(response).not.toBeNull();
          expect((response as { status: number }).status).toBe(403);
        }
      ),
      { numRuns: 100 }
    );
  });
});
