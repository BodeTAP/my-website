import type { ToolSettings } from "@/lib/toolSettings";

/**
 * Builds a human-readable concrete breakdown of what the welcome credits
 * actually buy. Used in landing pages and the freemium paywall to make
 * "X kredit gratis" feel tangible to non-technical users (UMKM, freelancer).
 *
 * Strategy (greedy, representation-first):
 *   1. Reserve 1 of each tool the user can afford, so every tool shows up.
 *   2. Spend the leftover credits on lead searches (cheapest, highest volume),
 *      then top up invoices, then proposals.
 * This avoids the previous bug where fixed percentage sub-budgets floored to
 * zero (e.g. 30% of 15 = 4 credits, /5 per proposal = 0 proposals).
 *
 * Examples (proposal 5, invoice 3, lead 2):
 *   15 credits -> "1 proposal + 1 invoice + 3x cari leads"  (5+3+6 = 14, +1 leftover)
 *   5 credits  -> "1 proposal"
 *   2 credits  -> "1x cari leads"
 */
export function getWelcomeCreditBreakdown(
  amount: number,
  settings: ToolSettings,
): { items: string[]; summary: string } {
  if (amount <= 0) return { items: [], summary: "" };

  const proposalCost = Math.max(1, settings.proposalGenerator.creditCost);
  const invoiceCost = Math.max(1, settings.invoiceGenerator.creditCost);
  const leadCost = Math.max(1, settings.leadFinder.standardCost);

  let remaining = amount;
  let proposals = 0;
  let invoices = 0;
  let leads = 0;

  // Step 1: reserve one of each affordable tool so all three are represented.
  if (remaining >= proposalCost) {
    proposals += 1;
    remaining -= proposalCost;
  }
  if (remaining >= invoiceCost) {
    invoices += 1;
    remaining -= invoiceCost;
  }
  if (remaining >= leadCost) {
    leads += 1;
    remaining -= leadCost;
  }

  // Step 2: spend leftovers greedily on lead searches (cheapest, most volume).
  if (leadCost > 0 && remaining >= leadCost) {
    const extra = Math.floor(remaining / leadCost);
    leads += extra;
    remaining -= extra * leadCost;
  }
  // Step 3: any remaining credits top up invoices, then proposals.
  if (invoiceCost > 0 && remaining >= invoiceCost) {
    const extra = Math.floor(remaining / invoiceCost);
    invoices += extra;
    remaining -= extra * invoiceCost;
  }
  if (proposalCost > 0 && remaining >= proposalCost) {
    const extra = Math.floor(remaining / proposalCost);
    proposals += extra;
    remaining -= extra * proposalCost;
  }

  const items: string[] = [];
  if (proposals > 0) items.push(`${proposals} proposal`);
  if (invoices > 0) items.push(`${invoices} invoice`);
  if (leads > 0) items.push(`${leads}x cari leads`);

  return {
    items,
    summary: items.join(" + "),
  };
}
