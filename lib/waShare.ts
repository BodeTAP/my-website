/**
 * Builds a WhatsApp `wa.me` deep link with a pre-filled message.
 *
 * - Accepts text content only (WhatsApp web does not accept attached files
 *   via URL). We include a short note + landing page URL instead so the
 *   recipient sees a context teaser, then the user manually attaches the
 *   downloaded PDF in their WhatsApp app.
 * - The link works on both wa.me and web.whatsapp.com.
 */
export function buildWaShareLink(message: string, phone?: string): string {
  const cleanPhone = phone ? phone.replace(/[^\d]/g, "") : "";
  const base = cleanPhone ? `https://wa.me/${cleanPhone}` : "https://wa.me/";
  const params = new URLSearchParams({ text: message });
  return `${base}?${params.toString()}`;
}

export type ProposalShareInput = {
  prospectName: string;
  businessName: string;
  price: number;
  validDays: number;
};

export function buildProposalWaMessage(input: ProposalShareInput): string {
  const priceFormatted = `Rp ${input.price.toLocaleString("id-ID")}`;
  return [
    `Halo ${input.prospectName},`,
    "",
    `Berikut proposal penawaran dari ${input.businessName} untuk kebutuhan Anda.`,
    `Total: ${priceFormatted}`,
    `Berlaku ${input.validDays} hari.`,
    "",
    "PDF lengkap saya kirim sebagai lampiran berikutnya. Terima kasih!",
  ].join("\n");
}

export type InvoiceShareInput = {
  invoiceNo: string;
  fromName: string;
  toName: string;
  total: number;
};

export function buildInvoiceWaMessage(input: InvoiceShareInput): string {
  const totalFormatted = `Rp ${input.total.toLocaleString("id-ID")}`;
  return [
    `Halo ${input.toName},`,
    "",
    `Berikut invoice ${input.invoiceNo} dari ${input.fromName}.`,
    `Total tagihan: ${totalFormatted}`,
    "",
    "PDF lengkap saya kirim sebagai lampiran berikutnya. Mohon konfirmasi setelah pembayaran ya, terima kasih!",
  ].join("\n");
}
