import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAiSettings } from "@/lib/aiSettings";
import PortalShell from "@/components/portal/PortalShell";
import AIHelpWidget from "@/components/portal/AIHelpWidget";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  // Fetch latest user details from DB to ensure sidebar reflects recent updates
  const [dbUser, aiSettings] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        image: true,
        email: true,
        client: {
          select: {
            credit: { select: { balance: true } },
          },
        },
      },
    }),
    getAiSettings(),
  ]);

  return (
    <PortalShell
      userName={dbUser?.name ?? session.user?.name ?? "Klien"}
      userEmail={dbUser?.email ?? session.user?.email ?? ""}
      userImage={dbUser?.image ?? session.user?.image ?? null}
      creditBalance={dbUser?.client?.credit?.balance ?? 0}
    >
      {children}
      {aiSettings.features.portalChat.enabled && (
        <AIHelpWidget maxMessages={aiSettings.portalMaxSessionMessages} />
      )}
    </PortalShell>
  );
}
