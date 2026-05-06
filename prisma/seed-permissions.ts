import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const VALID_MODULES = [
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

export async function seedPermissions() {
  // Ambil semua admin, diurutkan dari yang paling awal dibuat
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  if (admins.length === 0) {
    console.log("⚠️  Tidak ada admin ditemukan, skip seed permissions.");
    return;
  }

  // Buat role "Full Access" dengan semua 15 modul
  const fullAccessRole = await prisma.teamRole.upsert({
    where: { name: "Full Access" },
    create: {
      name: "Full Access",
      permissions: {
        create: VALID_MODULES.map((m) => ({ module: m })),
      },
    },
    update: {},
  });

  console.log(`✅ Role "Full Access" siap (id: ${fullAccessRole.id})`);

  // Buat AdminPermission untuk semua admin yang ada
  for (const admin of admins) {
    try {
      await prisma.adminPermission.upsert({
        where: { adminId: admin.id },
        create: { adminId: admin.id, roleId: fullAccessRole.id },
        update: {},
      });
      console.log(`   ✓ AdminPermission dibuat untuk ${admin.email}`);
    } catch (err) {
      // Error per-admin dicatat ke console, tidak menghentikan proses (Req 9.5)
      console.error(`   ✗ Gagal migrasi admin ${admin.id} (${admin.email}):`, err);
    }
  }

  // Tandai admin dengan createdAt paling awal sebagai Super Admin
  // jika belum ada Super Admin (Req 9.4)
  const existingSuperAdmin = await prisma.adminPermission.findFirst({
    where: { isSuperAdmin: true },
  });

  if (!existingSuperAdmin) {
    await prisma.adminPermission.update({
      where: { adminId: admins[0].id },
      data: { isSuperAdmin: true, roleId: null },
    });
    console.log(
      `✅ Admin pertama ditandai sebagai Super Admin: ${admins[0].email}`
    );
  } else {
    console.log("ℹ️  Super Admin sudah ada, skip penandaan Super Admin.");
  }
}

// Jalankan sebagai script terpisah jika dipanggil langsung
if (require.main === module) {
  seedPermissions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
