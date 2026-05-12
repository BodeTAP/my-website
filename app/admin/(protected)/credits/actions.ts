"use server";

import { revalidatePath } from "next/cache";
import { refundCredits, topupCredits } from "@/lib/credits";
import { requireModule } from "@/lib/permissions";

export type CreditAdjustState = {
  error?: string;
  success?: string;
};

export async function adjustCredits(
  _prevState: CreditAdjustState,
  formData: FormData,
): Promise<CreditAdjustState> {
  await requireModule("clients");

  const clientId = String(formData.get("clientId") ?? "");
  const clientName = String(formData.get("clientName") ?? "Klien");
  const type = String(formData.get("type") ?? "TOPUP");
  const amount = Number(formData.get("amount") ?? 0);
  const description = String(formData.get("description") ?? "").trim();

  if (!clientId) return { error: "Klien tidak valid." };
  if (!Number.isInteger(amount) || amount <= 0) return { error: "Jumlah kredit wajib lebih dari 0." };

  const safeDescription = description || (type === "REFUND" ? "Refund manual admin" : "Topup manual admin");
  const meta = { source: "admin_manual", type };

  if (type === "REFUND") {
    await refundCredits(clientId, amount, safeDescription, meta);
  } else {
    await topupCredits(clientId, amount, safeDescription, undefined, meta);
  }

  revalidatePath("/admin/credits");
  revalidatePath("/portal/credits");
  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/tools");

  return {
    success: `${type === "REFUND" ? "Refund" : "Topup"} ${amount} kredit untuk ${clientName} berhasil.`,
  };
}
