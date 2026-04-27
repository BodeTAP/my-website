import { prisma } from "@/lib/prisma";

type NotifType = "INVOICE_NEW" | "TICKET_REPLY" | "PROJECT_STATUS" | "GENERAL";

export async function createNotification(
  clientId: string,
  type: NotifType,
  title: string,
  body: string,
  link?: string,
) {
  return prisma.notification
    .create({ data: { clientId, type, title, body, link: link ?? null } })
    .catch(() => null);
}
