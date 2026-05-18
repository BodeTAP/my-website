import type { ToolSettings } from "@/lib/toolSettings";

/**
 * Builds a human-readable concrete breakdown of what the welcome credits
 * actually buy. Used in landing pages and the freemium paywall to make
 * "X kredit gratis" feel tangible to non-technical users (UMKM, freelancer).
 *
 * Strategy: pick a balanced split — a couple of proposals, a couple of
 * invoices, and a few standard lead searches — so each tool is represented.
 * Returns at most 3 chunks, joined with "+".
 *
 * Examples:
 *   15 credits, costs (proposal 5, invoice 3, lead 2):
 *     -> "3 proposal + 5 invoice + 5x cari leads"
 *   5 credits, costs (proposal 5, invoice 3, lead 2):
 *     -> "1 proposal" (because everything else does not fit)
 */
export function getWelcomeCreditBreakdown(
  amount: number,
  settings: ToolSettings,
): { items: string[]; summary: string } {
  if (amount <= 0) return { items: [], summary: "" };

  const proposalCost = Math.max(1, settings.proposalGenerator.creditCost);
  const invoiceCost = Math.max(1, settings.invoiceGenerator.creditCost);
  const leadCost = Math.max(1, settings.leadFinder.standardCost);

  // Target balanced split: try ~30% proposals, ~25% invoices, ~45% lead searches.
  let remaining = amount;
  const items: string[] = [];

  const proposalBudget = Math.floor(amount * 0.30);
  const proposalCount = Math.floor(proposalBudget / proposalCost);
  if (proposalCount > 0) {
    items.push(`${proposalCount} proposal`);
    remaining -= proposalCount * proposalCost;
  }

  const invoiceBudget = Math.floor(amount * 0.25);
  const invoiceCount = Math.floor(invoiceBudget / invoiceCost);
  if (invoiceCount > 0) {
    items.push(`${invoiceCount} invoice`);
    remaining -= invoiceCount * invoiceCost;
  }

  const leadCount = Math.floor(remaining / leadCost);
  if (leadCount > 0) {
    items.push(`${leadCount}x cari leads`);
  }

  // Fallback: if nothing fits, show whatever single tool is buyable.
  if (items.length === 0) {
    if (amount >= proposalCost) items.push("1 proposal");
    else if (amount >= invoiceCost) items.push("1 invoice");
    else if (amount >= leadCost) items.push("1x cari leads");
  }

  return {
    items,
    summary: items.join(" + "),
  };
}
