import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedPermissions } from "./seed-permissions";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mfweb.com" },
    update: {},
    create: {
      email: "admin@mfweb.com",
      name: "MFWEB Admin",
      password,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);
  console.log("   Password: admin123 (ganti setelah login pertama!)");

  // Seed permissions — buat role "Full Access" dan migrasi admin yang ada
  await seedPermissions();

  const creditPackages = [
    { name: "Starter", credits: 50, price: 39000, bonusCredit: 0 },
    { name: "Growth", credits: 150, price: 99000, bonusCredit: 10 },
    { name: "Pro", credits: 300, price: 179000, bonusCredit: 30 },
  ];

  for (const pkg of creditPackages) {
    const existing = await prisma.creditPackage.findFirst({
      where: { name: pkg.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.creditPackage.update({
        where: { id: existing.id },
        data: { ...pkg, isActive: true },
      });
    } else {
      await prisma.creditPackage.create({
        data: { ...pkg, isActive: true },
      });
    }
  }

  console.log("Credit packages seeded:", creditPackages.map((pkg) => pkg.name).join(", "));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
