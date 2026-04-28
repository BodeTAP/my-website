const FONNTE_URL = "https://api.fonnte.com/send";

/** Normalize Indonesian phone to 628xxx format (no +, no spaces) */
export function normalizePhone(raw: string): string {
  let n = raw.replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (n.startsWith("8") && n.length <= 13) n = "62" + n;
  return n;
}

/** Send a WhatsApp message via Fonnte. Returns true on success. */
export async function sendWA(to: string, message: string): Promise<boolean> {
  const key = process.env.FONNTE_API_KEY;

  if (!key) {
    console.error("[WA] FONNTE_API_KEY belum dikonfigurasi");
    return false;
  }
  if (!to?.trim()) {
    console.warn("[WA] Nomor tujuan kosong — pesan tidak dikirim");
    return false;
  }

  const phone = normalizePhone(to);
  if (phone.length < 10) {
    console.error("[WA] Nomor tidak valid setelah normalisasi:", phone);
    return false;
  }

  // Fonnte lebih stabil dengan URLSearchParams daripada JSON
  const body = new URLSearchParams({
    target: phone,
    message,
    countryCode: "62",
  });

  try {
    const res = await fetch(FONNTE_URL, {
      method: "POST",
      headers: { Authorization: key },
      body,
    });
    const data = (await res.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!res.ok || data?.status === false) {
      console.error("[WA] Fonnte error:", res.status, JSON.stringify(data));
      return false;
    }

    console.log("[WA] Terkirim ke", phone, "→", data?.status ?? "ok");
    return true;
  } catch (err) {
    console.error("[WA] Fetch error:", err);
    return false;
  }
}

// ── Message templates ──────────────────────────────────────────────────────────

const FOOTER = "\n\n_MFWEB · mfweb.id_";

const PROJECT_STAGE: Record<string, { label: string; desc: string }> = {
  DRAFTING: {
    label: "Perancangan & Briefing",
    desc: "Tim kami sedang mendiskusikan konsep dan desain website Anda.",
  },
  DEVELOPMENT: {
    label: "Pengembangan Website",
    desc: "Website Anda sedang aktif dikerjakan oleh tim developer kami.",
  },
  TESTING: {
    label: "Testing & Review",
    desc: "Website sedang diuji coba dan siap untuk review Anda.",
  },
  LIVE: {
    label: "Live! 🚀",
    desc: "Website Anda sudah resmi diluncurkan. Selamat!",
  },
};

export const waMsg = {
  invoiceNew(
    name: string,
    invoiceNo: string,
    amount: number,
    dueDate?: Date | null,
  ) {
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

  paymentInitiated(
    name: string,
    invoiceNo: string,
    amount: number,
    methodName: string,
    paymentUrl: string,
    payCode?: string | null,
  ) {
    const rp = `Rp ${amount.toLocaleString("id-ID")}`;
    // Only show pay_code when it's a plain code (VA number / alfamart code), not a URL
    const codeLine =
      payCode && !payCode.startsWith("http")
        ? `🔢 Nomor Pembayaran: *${payCode}*\n`
        : "";
    return (
      `Halo ${name}! 👋\n\n` +
      `Transaksi pembayaran untuk invoice *${invoiceNo}* telah dibuat.\n\n` +
      `💰 Total: *${rp}*\n` +
      `💳 Metode: *${methodName}*\n` +
      `${codeLine}` +
      `🔗 Link Pembayaran:\n${paymentUrl}\n\n` +
      `⏰ Berlaku 1 jam. Segera selesaikan pembayaran Anda.` +
      FOOTER
    );
  },

  /** Sent to client when their payment is confirmed PAID */
  paymentPaid(name: string, invoiceNo: string, amount: number, method: string) {
    const rp = `Rp ${amount.toLocaleString("id-ID")}`;
    return (
      `Halo ${name}! 🎉\n\n` +
      `Pembayaran Anda telah *berhasil dikonfirmasi*.\n\n` +
      `✅ Invoice: *${invoiceNo}*\n` +
      `💰 Jumlah: *${rp}*\n` +
      `💳 Metode: ${method}\n\n` +
      `Terima kasih telah mempercayakan website Anda kepada kami. ` +
      `Tim kami akan segera memulai pengerjaan sesuai jadwal yang disepakati.` +
      FOOTER
    );
  },

  /** Sent to admin when a payment is received */
  paymentReceivedAdmin(
    clientName: string,
    businessName: string,
    invoiceNo: string,
    amount: number,
    method: string,
  ) {
    const rp = `Rp ${amount.toLocaleString("id-ID")}`;
    return (
      `💰 *Pembayaran Masuk!*\n\n` +
      `👤 Klien: ${clientName} (${businessName})\n` +
      `📄 Invoice: *${invoiceNo}*\n` +
      `✅ Jumlah: *${rp}*\n` +
      `💳 Metode: ${method}\n\n` +
      `Invoice telah otomatis ditandai LUNAS.`
    );
  },

  newLead(
    name: string,
    businessName: string,
    whatsapp: string,
    domain?: string | null,
    message?: string | null,
  ) {
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
