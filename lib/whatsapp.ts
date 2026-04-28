const FONNTE_URL = "https://api.fonnte.com/send";

/** Normalize Indonesian phone to 628xxx format (no +, no spaces) */
function normalizePhone(raw: string): string {
  let n = raw.replace(/\D/g, "");
  if (n.startsWith("0"))  n = "62" + n.slice(1);
  if (n.startsWith("8") && n.length <= 13) n = "62" + n;
  return n;
}

/** Send a WhatsApp message via Fonnte. Returns true on success. */
export async function sendWA(to: string, message: string): Promise<boolean> {
  const key = process.env.FONNTE_API_KEY;
  if (!key || !to) return false;

  const phone = normalizePhone(to);
  if (phone.length < 10) return false;

  try {
    const res = await fetch(FONNTE_URL, {
      method: "POST",
      headers: { Authorization: key, "Content-Type": "application/json" },
      body: JSON.stringify({ target: phone, message, countryCode: "62" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Message templates ──────────────────────────────────────────────────────────

const FOOTER = "\n\n_MFWEB · mfweb.id_";

const PROJECT_STAGE: Record<string, { label: string; desc: string }> = {
  DRAFTING:    { label: "Perancangan & Briefing",   desc: "Tim kami sedang mendiskusikan konsep dan desain website Anda." },
  DEVELOPMENT: { label: "Pengembangan Website",      desc: "Website Anda sedang aktif dikerjakan oleh tim developer kami." },
  TESTING:     { label: "Testing & Review",          desc: "Website sedang diuji coba dan siap untuk review Anda." },
  LIVE:        { label: "Live! 🚀",                  desc: "Website Anda sudah resmi diluncurkan. Selamat!" },
};

export const waMsg = {
  /** Sent to client when a new invoice is issued */
  invoiceNew(name: string, invoiceNo: string, amount: number, dueDate?: Date | null) {
    const rp = `Rp ${amount.toLocaleString("id-ID")}`;
    const due = dueDate
      ? `\n📅 Jatuh tempo: ${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(dueDate)}`
      : "";
    return (
      `Halo ${name}! 👋\n\n` +
      `Invoice baru telah diterbitkan untuk Anda.\n\n` +
      `📄 No. Invoice: *${invoiceNo}*\n` +
      `💰 Jumlah: *${rp}*${due}\n\n` +
      `Silakan cek portal klien untuk detail dan konfirmasi pembayaran.` +
      FOOTER
    );
  },

  /** Sent to client when project status changes */
  projectStatus(name: string, projectName: string, status: string) {
    const stage = PROJECT_STAGE[status] ?? { label: status, desc: "" };
    return (
      `Halo ${name}! 👋\n\n` +
      `Update terbaru untuk proyek *${projectName}*:\n\n` +
      `✅ Status: *${stage.label}*\n` +
      `${stage.desc}\n\n` +
      `Pantau progress lengkap di portal klien Anda.` +
      FOOTER
    );
  },

  /** Sent to client when admin replies to a ticket */
  ticketReply(name: string, subject: string, preview: string) {
    return (
      `Halo ${name}! 👋\n\n` +
      `Tim MFWEB telah membalas tiket Anda:\n\n` +
      `📌 *${subject}*\n` +
      `💬 "${preview}"\n\n` +
      `Cek balasan lengkap di portal klien Anda.` +
      FOOTER
    );
  },

  /** Sent to admin when a new lead submits the contact form */
  newLead(name: string, businessName: string, whatsapp: string, domain?: string | null, message?: string | null) {
    const lines = [
      `🔔 *Lead Baru Masuk!*\n`,
      `👤 Nama: ${name}`,
      `🏢 Bisnis: ${businessName}`,
      `📱 WA: ${whatsapp}`,
    ];
    if (domain) lines.push(`🌐 Domain: ${domain}`);
    if (message) lines.push(`\n💬 Pesan:\n${message}`);
    lines.push(`\nBuka admin panel untuk follow-up.`);
    return lines.join("\n");
  },
};
