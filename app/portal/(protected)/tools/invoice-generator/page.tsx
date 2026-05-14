import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientBalance } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import { getToolSettings } from "@/lib/toolSettings";
import InvoiceGeneratorClient, { type GeneratedInvoiceView } from "./InvoiceGeneratorClient";

export default async function PortalInvoiceGeneratorPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      client: {
        select: {
          id: true,
          businessName: true,
          phone: true,
          address: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!user?.client) redirect("/portal/dashboard");

  const [balance, invoices, toolSettings] = await Promise.all([
    getClientBalance(user.client.id),
    prisma.generatedInvoice.findMany({
      where: { clientId: user.client.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getToolSettings(),
  ]);

  return (
    <InvoiceGeneratorClient
      initialBalance={balance}
      enabled={toolSettings.invoiceGenerator.enabled}
      invoiceCost={toolSettings.invoiceGenerator.creditCost}
      clientDefaults={{
        businessName: user.client.businessName,
        email: user.client.user.email,
        phone: user.client.phone ?? "",
        address: user.client.address ?? "",
      }}
      initialInvoices={invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNo: invoice.invoiceNo,
        title: invoice.title,
        billToName: invoice.billToName,
        issueDate: invoice.issueDate.toISOString().slice(0, 10),
        dueDate: invoice.dueDate?.toISOString().slice(0, 10) ?? null,
        total: invoice.total,
        createdAt: invoice.createdAt.toISOString(),
      })) satisfies GeneratedInvoiceView[]}
    />
  );
}
