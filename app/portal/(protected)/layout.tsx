import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PortalShell from "@/components/portal/PortalShell";
import AIHelpWidget from "@/components/portal/AIHelpWidget";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/portal/login");

  return (
    <PortalShell
      userName={session.user?.name ?? "Klien"}
      userEmail={session.user?.email ?? ""}
      userImage={session.user?.image ?? null}
    >
      {children}
      <AIHelpWidget />
    </PortalShell>
  );
}
