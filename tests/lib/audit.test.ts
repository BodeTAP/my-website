import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    permissionAuditLog: {
      create: vi.fn(),
    },
  },
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { logPermissionChange } from "@/lib/audit";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_ACTIONS = [
  "ROLE_CREATED",
  "ROLE_UPDATED",
  "ROLE_DELETED",
  "ROLE_ASSIGNED",
  "ROLE_UNASSIGNED",
  "ADMIN_REASSIGNED",
] as const;

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.permissionAuditLog.create).mockResolvedValue({} as never);
});

// Feature: team-permissions, Property 10: Audit log selalu tercatat
describe("Property 10: Audit log selalu tercatat", () => {
  it("logPermissionChange memanggil prisma.permissionAuditLog.create tepat sekali per panggilan", async () => {
    // Validates: Requirements 8.4
    await fc.assert(
      fc.asyncProperty(
        // changedBy: random non-empty string (Super Admin userId)
        fc.string({ minLength: 1, maxLength: 50 }),
        // action: random valid action from the enum
        fc.constantFrom(...VALID_ACTIONS),
        // before: random object with string keys and primitive values
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.oneof(fc.string(), fc.integer(), fc.boolean())
        ),
        // after: random object with string keys and primitive values
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.oneof(fc.string(), fc.integer(), fc.boolean())
        ),
        async (changedBy, action, before, after) => {
          vi.clearAllMocks();
          vi.mocked(prisma.permissionAuditLog.create).mockResolvedValue({} as never);

          await logPermissionChange({ changedBy, action, before, after });

          // Must be called exactly once
          expect(prisma.permissionAuditLog.create).toHaveBeenCalledTimes(1);

          // Must be called with the correct data shape
          expect(prisma.permissionAuditLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
              changedBy,
              action,
              before,
              after,
            }),
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
