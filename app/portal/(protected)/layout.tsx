import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PortalShell from "@/components/portal/PortalShell";
import AIHelpWidget from "@/components/portal/AIHelpWidget";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  // Fetch latest user details from DB to ensure sidebar reflects recent updates
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, image: true, email: true },
  });

  return (
    <PortalShell
      userName={dbUser?.name ?? session.user?.name ?? "Klien"}
      userEmail={dbUser?.email ?? session.user?.email ?? ""}
      userImage={dbUser?.image ?? session.user?.image ?? null}
    >
      {children}
      <AIHelpWidget />
    </PortalShell>
  );
}
