import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireApiPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { Prisma, LeadStatus, WhatsAppOptInStatus } from "@prisma/client";

const VALID_LEAD_STATUSES = new Set<string>(["NEW", "FOLLOWUP", "DEAL", "CLOSED"]);
const VALID_CONSENT_STATUSES = new Set<string>(["UNKNOWN", "OPTED_IN", "OPTED_OUT"]);

// GET — paginated leads list with filters
export async function GET(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("leads");
  if (denied) return denied;

  const { searchParams } = req.nextUrl;
  const page    = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage = Math.min(200, Math.max(10, Number(searchParams.get("perPage") ?? "50")));
  const q       = searchParams.get("q")?.trim() ?? "";
  const rawStatus  = searchParams.get("status") ?? "ALL";
  const rawConsent = searchParams.get("consent") ?? "ALL";
  const hasWebsite = searchParams.get("hasWebsite") ?? "ALL";
  const neverContacted = searchParams.get("neverContacted") === "true";
  const category = searchParams.get("category") ?? "ALL";

  const statusFilter: LeadStatus | undefined =
    rawStatus !== "ALL" && VALID_LEAD_STATUSES.has(rawStatus)
      ? (rawStatus as LeadStatus)
      : undefined;

  const consentFilter: WhatsAppOptInStatus | undefined =
    rawConsent !== "ALL" && VALID_CONSENT_STATUSES.has(rawConsent)
      ? (rawConsent as WhatsAppOptInStatus)
      : undefined;

  // Build where clause using Prisma's generated type
  const andClauses: Prisma.LeadWhereInput[] = [];

  if (q) {
    andClauses.push({
      OR: [
        { name:         { contains: q, mode: "insensitive" } },
        { businessName: { contains: q, mode: "insensitive" } },
        { whatsapp:     { contains: q } },
        { domain:       { contains: q, mode: "insensitive" } },
      ],
    });
  }

  // Category filter — uses same keyword detection as broadcast route
  if (category !== "ALL") {
    const CATEGORY_KEYWORDS: Record<string, string[]> = {
      food:     ["resto", "restoran", "warung", "cafe", "kafe", "makan", "kuliner", "bakery", "catering", "kedai", "rumah makan", "food"],
      retail:   ["toko", "shop", "store", "jualan", "dagang", "olshop", "online shop", "butik", "fashion", "pakaian", "baju", "sepatu"],
      health:   ["klinik", "dokter", "apotek", "farmasi", "kesehatan", "medis", "rumah sakit", "puskesmas", "fisioterapi"],
      beauty:   ["salon", "spa", "kecantikan", "barbershop", "barber", "nail", "skincare", "kosmetik", "perawatan"],
      service:  ["jasa", "servis", "bengkel", "laundry", "cuci", "ekspedisi", "logistik", "travel", "tour", "rental", "sewa"],
      property: ["properti", "rumah", "kos", "kontrakan", "apartemen", "ruko", "tanah", "agen", "developer"],
      edu:      ["kursus", "les", "bimbel", "sekolah", "pendidikan", "training", "pelatihan", "akademi"],
    };
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords) {
      andClauses.push({
        OR: keywords.map((kw) => ({ businessName: { contains: kw, mode: "insensitive" } })),
      });
    }
  }

  const where: Prisma.LeadWhereInput = {
    ...(statusFilter !== undefined ? { status: statusFilter } : {}),
    ...(consentFilter !== undefined ? { waOptInStatus: consentFilter } : {}),
    ...(hasWebsite === "yes" ? { currentWebsite: { not: null } } : {}),
    ...(hasWebsite === "no"  ? { currentWebsite: null } : {}),
    ...(neverContacted ? { lastContactedAt: null } : {}),
    ...(andClauses.length > 0 ? { AND: andClauses } : {}),
  };

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * perPage,
      take:  perPage,
    }),
  ]);

  return NextResponse.json({
    leads,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
}

// DELETE — bulk delete leads
export async function DELETE(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("leads");
  if (denied) return denied;

  try {
    const { ids } = await req.json() as { ids: string[] };
    if (!ids?.length) return NextResponse.json({ error: "Pilih minimal 1 lead" }, { status: 400 });
    if (ids.length > 100) return NextResponse.json({ error: "Maksimal 100 lead sekaligus" }, { status: 400 });

    const { count } = await prisma.lead.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ deleted: count });
  } catch (err) {
    console.error("[Leads-DELETE]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST — bulk create leads (dari LeadFinder)
export async function POST(req: NextRequest) {
  if (await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireApiPermission("leads");
  if (denied) return denied;

  try {
    const body = await req.json();
    const rows = Array.isArray(body) ? body : [body];

    if (rows.length === 0) return NextResponse.json({ error: "Data kosong" }, { status: 400 });
    if (rows.length > 20)  return NextResponse.json({ error: "Maksimal 20 lead sekaligus" }, { status: 400 });

    // Skip duplikat berdasarkan nomor WhatsApp
    const phones = rows.map((r: { whatsapp: string }) => r.whatsapp).filter(Boolean);
    const existing = await prisma.lead.findMany({
      where: { whatsapp: { in: phones } },
      select: { whatsapp: true },
    });
    const existingPhones = new Set(existing.map((e) => e.whatsapp));

    const toInsert = rows.filter((r: { whatsapp: string }) => !existingPhones.has(r.whatsapp));

    if (toInsert.length === 0) {
      return NextResponse.json({ created: 0, skipped: rows.length, message: "Semua lead sudah ada di database." });
    }

    await prisma.lead.createMany({
      data: toInsert.map((r: {
        name: string; businessName: string; whatsapp: string;
        currentWebsite?: string; message?: string; notes?: string;
      }) => ({
        name:           r.name,
        businessName:   r.businessName,
        whatsapp:       r.whatsapp,
        currentWebsite: r.currentWebsite ?? null,
        message:        r.message ?? null,
        notes:          r.notes ?? null,
        status:         "NEW",
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ created: toInsert.length, skipped: rows.length - toInsert.length });
  } catch (err) {
    console.error("[Leads-POST]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
