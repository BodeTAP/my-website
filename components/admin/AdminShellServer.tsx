import { auth } from "@/lib/auth";
import { getAdminModules, isSuperAdmin } from "@/lib/permissions";
import AdminShell from "./AdminShell";

export default async function AdminShellServer({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    // Fallback — layout already handles redirect, this shouldn't happen
    return <AdminShell allowedModules={[]} isSuperAdmin={false}>{children}</AdminShell>;
  }

  const [modules, superAdmin] = await Promise.all([
    getAdminModules(userId),
    isSuperAdmin(userId),
  ]);

  return (
    <AdminShell allowedModules={modules} isSuperAdmin={superAdmin}>
      {children}
    </AdminShell>
  );
}
