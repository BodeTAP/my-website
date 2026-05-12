"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { refundCredits, topupCredits } from "@/lib/credits";
import { requireModule } from "@/lib/permissions";

export type CreditAdjustState = {
  error?: string;
  success?: string;
};

export type CreditPackageState = {
  error?: string;
  success?: string;
};

function readPackageInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const credits = Number(formData.get("credits") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  const bonusCredit = Number(formData.get("bonusCredit") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!name) return { error: "Nama paket wajib diisi." };
  if (!Number.isInteger(credits) || credits <= 0) return { error: "Jumlah kredit wajib lebih dari 0." };
  if (!Number.isInteger(price) || price < 0) return { error: "Harga tidak valid." };
  if (!Number.isInteger(bonusCredit) || bonusCredit < 0) return { error: "Bonus kredit tidak valid." };

  return { data: { name, credits, price, bonusCredit, isActive } };
}

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

export async function createCreditPackage(
  _prevState: CreditPackageState,
  formData: FormData,
): Promise<CreditPackageState> {
  await requireModule("clients");

  const parsed = readPackageInput(formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.creditPackage.create({ data: parsed.data });
  revalidatePath("/admin/credits");
  revalidatePath("/portal/credits");

  return { success: `Paket ${parsed.data.name} berhasil ditambahkan.` };
}

export async function updateCreditPackage(
  _prevState: CreditPackageState,
  formData: FormData,
): Promise<CreditPackageState> {
  await requireModule("clients");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Paket tidak valid." };

  const parsed = readPackageInput(formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.creditPackage.update({
    where: { id },
    data: parsed.data,
  });
  revalidatePath("/admin/credits");
  revalidatePath("/portal/credits");

  return { success: `Paket ${parsed.data.name} berhasil diperbarui.` };
}

export async function deleteCreditPackage(
  _prevState: CreditPackageState,
  formData: FormData,
): Promise<CreditPackageState> {
  await requireModule("clients");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "Paket");
  if (!id) return { error: "Paket tidak valid." };

  await prisma.creditPackage.delete({ where: { id } });
  revalidatePath("/admin/credits");
  revalidatePath("/portal/credits");

  return { success: `${name} berhasil dihapus.` };
}
