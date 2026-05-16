import { prisma } from "@/lib/prisma";

export const SITE_SETTING_DEFAULTS: Record<string, string> = {
  brand_name: "MFWEB",
  brand_domain: "mfweb.maffisorp.id",
  brand_site_url: "https://mfweb.maffisorp.id",
  brand_contact_email: "hello@mfweb.id",
  brand_public_whatsapp: "6282221682343",
  brand_consultation_url: "/contact",
  brand_business_address: "Jl. Brigadir Jenderal Katamso No.14, Kp. Dalem, Kec. Kota, Kota Kediri, Jawa Timur",
  brand_legal_name: "MFWEB",
  brand_footer_text: "MFWEB. All rights reserved.",
  brand_logo_url: "/logo.png",
  brand_favicon_url: "/favicon.ico",
  brand_default_og_image: "/og-image.png",

  home_hero_badge: "Tersedia untuk proyek baru",
  home_hero_headline: "Website Profesional dan Tools Bisnis untuk Mendatangkan Klien",
  home_hero_subheadline:
    "Bangun website cepat, tampil profesional di Google, lalu gunakan Lead Finder, Proposal Generator, dan Invoice Generator untuk mempercepat proses jualan sampai closing.",
  home_primary_cta_label: "Konsultasi Website",
  home_primary_cta_url: "/contact",
  home_secondary_cta_label: "Lihat Tools Bisnis",
  home_secondary_cta_url: "/tools",
  hero_stat_1_num: "50+",
  hero_stat_1_label: "Proyek selesai",
  hero_stat_2_num: "95%",
  hero_stat_2_label: "Klien puas",
  hero_stat_3_num: "3 hari",
  hero_stat_3_label: "Rata-rata delivery",
  social_instagram_url: "",
  social_facebook_url: "",
  social_linkedin_url: "",

  seo_default_title_template: "%s | MFWEB",
  seo_default_title: "Jasa Website Profesional & Tools Bisnis untuk UMKM | MFWEB",
  seo_default_description:
    "MFWEB membantu bisnis lokal punya website profesional, mudah ditemukan di Google, dan memakai tools bisnis untuk cari lead, buat proposal, serta invoice PDF.",
  seo_default_og_image: "/og-image.png",
  seo_canonical_base_url: "https://mfweb.maffisorp.id",
  facebook_pixel_id: "",
  google_analytics_id: "",

  template_email_invoice_subject: "Invoice {invoiceNo} - {brandName}",
  template_email_invoice_body:
    "Halo {clientName},\n\nInvoice baru telah dibuat untuk Anda.\n\nNomor invoice: {invoiceNo}\nJumlah tagihan: {amount}\nJatuh tempo: {dueDate}\n\nSilakan lihat invoice melalui portal klien: {invoiceUrl}\n\nTerima kasih.",
  template_email_magic_link_subject: "Link masuk ke {brandName}",
  template_email_magic_link_body:
    "Halo,\n\nKlik link berikut untuk masuk ke portal {brandName}:\n{url}\n\nLink ini hanya berlaku sementara. Abaikan email ini jika Anda tidak meminta login.",
  template_wa_invoice_reminder:
    "Halo {clientName}! Tagihan {invoiceNo} sebesar {amount} jatuh tempo {dueDate}. Bayar di: {paymentUrl}\n\nAbaikan jika sudah membayar.\n\n_{brandName}_",
  template_wa_ticket_reply:
    "Halo {clientName}! Tim {brandName} telah membalas tiket Anda: {ticketSubject}\n\n{messagePreview}\n\nCek portal klien untuk balasan lengkap.",
  template_wa_hosting_expiry:
    "Halo {clientName}! {typeLabel} untuk {domainName} akan expired pada {expiryDate} ({daysLeft} hari lagi). Hubungi kami untuk perpanjangan.\n\n_{brandName}_",
  template_wa_maintenance_billing:
    "Halo {clientName}! Invoice maintenance {invoiceNo} sebesar {amount} sudah diterbitkan. Bayar di: {paymentUrl}\n\n_{brandName}_",
  template_admin_notification:
    "Notifikasi admin: {eventName}\n\n{details}",

  invoice_prefix: "INV",
  invoice_valid_days: "7",
  invoice_reminder_schedule_days: "7,3,1,0,-3",
  payment_gateway_mode: "live",
  payment_fee_handling: "customer",
  payment_default_instructions:
    "Silakan lakukan pembayaran melalui metode yang tersedia. Setelah pembayaran berhasil, status invoice akan diperbarui otomatis.",
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.keys(SITE_SETTING_DEFAULTS) } },
    });
    const settings = { ...SITE_SETTING_DEFAULTS };
    for (const row of rows) settings[row.key] = row.value;
    return settings;
  } catch (err) {
    console.error("[SiteSettings] Failed to load settings:", err);
    return { ...SITE_SETTING_DEFAULTS };
  }
}

export function renderSettingTemplate(template: string, values: Record<string, string | number | null | undefined>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, "g"), String(value ?? "")),
    template,
  );
}

export function normalizeSiteSettingValue(key: string, value: unknown): string | null {
  if (!(key in SITE_SETTING_DEFAULTS)) return null;
  const raw = String(value ?? "");

  if (key === "payment_gateway_mode") return raw === "sandbox" ? "sandbox" : "live";
  if (key === "payment_fee_handling") {
    return raw === "merchant" || raw === "split" ? raw : "customer";
  }
  if (key === "invoice_valid_days") {
    const parsed = Number.parseInt(raw, 10);
    return String(Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 90) : 7);
  }
  if (key === "invoice_reminder_schedule_days") {
    const days = raw
      .split(",")
      .map((item) => Number.parseInt(item.trim(), 10))
      .filter((day) => Number.isFinite(day) && day >= -30 && day <= 90);
    return days.length > 0 ? [...new Set(days)].join(",") : SITE_SETTING_DEFAULTS.invoice_reminder_schedule_days;
  }
  if (key === "brand_site_url" || key === "seo_canonical_base_url") {
    return raw.trim().replace(/\/+$/, "");
  }

  return raw;
}
