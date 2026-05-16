import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientInvoiceDesign, upsertClientInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";
import { getClientProposalDesign, upsertClientProposalDesign } from "@/lib/proposalDesign";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function asColor(value: unknown, fallback: string) {
  return typeof value === "string" && HEX_RE.test(value) ? value : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 500) : fallback;
}

async function getClientId() {
  const session = await auth();
  if (!session?.user?.email) return { status: 401 as const, clientId: null };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { client: { select: { id: true } } },
  });

  if (!user?.client) return { status: 404 as const, clientId: null };
  return { status: 200 as const, clientId: user.client.id };
}

export async function PUT(req: NextRequest) {
  const { status, clientId } = await getClientId();
  if (!clientId) return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Client not found" }, { status });

  const body = await req.json().catch(() => ({}));
  const [proposalDesign, invoiceDesign] = await Promise.all([
    getClientProposalDesign(clientId),
    getClientInvoiceDesign(clientId),
  ]);
  const logoUrl = asString(body.logoUrl, proposalDesign.logoUrl ?? invoiceDesign.logoUrl ?? "") || null;
  const primaryColor = asColor(body.primaryColor, proposalDesign.primaryColor);
  const accentColor = asColor(body.accentColor, proposalDesign.accentColor);
  const fontStyle = ["sans", "serif", "mono"].includes(body.fontStyle) ? body.fontStyle : proposalDesign.fontStyle;

  const [proposal, invoice] = await Promise.all([
    upsertClientProposalDesign(clientId, {
      ...proposalDesign,
      logoUrl,
      primaryColor,
      accentColor,
      fontStyle,
    }),
    upsertClientInvoiceDesign(clientId, {
      ...invoiceDesign,
      logoUrl,
      primaryColor,
      accentColor,
      fontStyle,
    }),
  ]);

  return NextResponse.json({ proposal, invoice });
}
