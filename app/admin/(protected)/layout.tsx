import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShellServer from "@/components/admin/AdminShellServer";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return <AdminShellServer>{children}</AdminShellServer>;
}
