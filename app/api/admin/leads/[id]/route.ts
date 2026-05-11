import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
const WA_OPT_IN_STATUSES = new Set(["UNKNOWN", "OPTED_IN", "OPTED_OUT"]);

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const denied = await requireApiPermission("leads");
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();

  try {
    const data: {
      status?: "NEW" | "FOLLOWUP" | "DEAL" | "CLOSED";
      notes?: string | null;
      waOptInStatus?: "UNKNOWN" | "OPTED_IN" | "OPTED_OUT";
      waOptInAt?: Date | null;
      waOptInSource?: string | null;
      waOptOutAt?: Date | null;
      waOptOutReason?: string | null;
      doNotContact?: boolean;
    } = {};

    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;

    if (body.waOptInStatus !== undefined) {
      if (!WA_OPT_IN_STATUSES.has(body.waOptInStatus)) {
        return NextResponse.json({ error: "Status consent WhatsApp tidak valid" }, { status: 400 });
      }

      data.waOptInStatus = body.waOptInStatus;
      if (body.waOptInStatus === "OPTED_IN") {
        data.waOptInAt = new Date();
        data.waOptInSource = body.waOptInSource ?? "admin";
        data.waOptOutAt = null;
        data.waOptOutReason = null;
        data.doNotContact = false;
      } else if (body.waOptInStatus === "OPTED_OUT") {
        data.waOptOutAt = new Date();
        data.waOptOutReason = body.waOptOutReason ?? "admin";
        data.doNotContact = true;
      } else {
        data.waOptInAt = null;
        data.waOptInSource = null;
        data.waOptOutAt = null;
        data.waOptOutReason = null;
        data.doNotContact = false;
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
