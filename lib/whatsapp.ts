const FONNTE_URL = "https://api.fonnte.com/send";

/** Normalize Indonesian phone to 628xxx format (no +, no spaces) */
export function normalizePhone(raw: string): string {
  let n = raw.replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (n.startsWith("8") && n.length <= 13) n = "62" + n;
  return n;
}

/** Send a WhatsApp message via Fonnte. Returns true on success.
 *  Pass apiKey explicitly for bulk sends (pre-fetched via getFonnteKey from lib/getFonnteKey). */
export async function sendWA(
  to: string,
  message: string,
  apiKey?: string,
): Promise<boolean> {
  const key = apiKey ?? process.env.FONNTE_API_KEY;

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

// ── Batch sender (rotator) ─────────────────────────────────────────────────────

type BatchItem = {
  phone: string; // raw phone, will be normalized
  message: string;
};

type BatchResult = {
  phone: string;
  ok: boolean;
};

/**
 * Send multiple WhatsApp messages in a SINGLE Fonnte API call using the
 * `data` parameter. Benefits vs sequential sendWA() calls:
 *
 * 1. No server-side delay loop → zero risk of Vercel function timeout.
 * 2. Fonnte handles the delay internally (4–8 seconds random between messages).
 * 3. When multiple API tokens are passed (comma-separated), Fonnte
 *    automatically rotates the sending device per message — built-in rotator.
 *
 * @param items   Array of { phone, message } objects.
 * @param apiKeys Array of Fonnte tokens (all must belong to same account).
 *                Fonnte will rotate devices when more than one token is given.
 * @param delayRange Random delay range in seconds between messages, default "4-8".
 */
export async function sendWABatch(
  items: BatchItem[],
  apiKeys: string[],
  delayRange = "4-8",
): Promise<BatchResult[]> {
  if (!apiKeys.length) {
    console.error("[WA Batch] No Fonnte API keys configured");
    return items.map((i) => ({ phone: i.phone, ok: false }));
  }
  if (!items.length) return [];

  // Join multiple tokens → Fonnte rotates devices automatically
  const authHeader = apiKeys.join(",");

  // Build the data array — each item is one message with a random delay
  const dataPayload = items.map((item, idx) => ({
    target: normalizePhone(item.phone),
    message: item.message,
    countryCode: "62",
    // First message is sent immediately, rest get the delay
    ...(idx > 0 ? { delay: delayRange } : {}),
  }));

  // `data` must be a JSON string per Fonnte docs
  const body = new URLSearchParams({
    data: JSON.stringify(dataPayload),
  });

  try {
    const res = await fetch(FONNTE_URL, {
      method: "POST",
      headers: { Authorization: authHeader },
      body,
    });

    const json = (await res.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!res.ok || json?.status === false) {
      console.error(
        "[WA Batch] Fonnte error:",
        res.status,
        JSON.stringify(json),
      );
      // Mark all as failed on API-level error
      return items.map((i) => ({ phone: i.phone, ok: false }));
    }

    console.log(
      `[WA Batch] Queued ${items.length} messages via ${apiKeys.length} device(s) →`,
      json?.detail ?? "ok",
    );

    // Fonnte queues all successfully — mark all as ok
    return items.map((i) => ({ phone: i.phone, ok: true }));
  } catch (err) {
    console.error("[WA Batch] Fetch error:", err);
    return items.map((i) => ({ phone: i.phone, ok: false }));
  }
}

// ── Message templates ──────────────────────────────────────────────────────────

const FOOTER = "\n\n_MFWEB · mfweb.maffisorp.id_";

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
    paymentUrl?: string | null,
  ) {
    const rp = `Rp ${amount.toLocaleString("id-ID")}`;
    const due = dueDate
      ? `\n📅 Jatuh tempo: ${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(dueDate)}`
      : "";
    const link = paymentUrl ? `\n\n💳 Bayar sekarang:\n${paymentUrl}` : "";
    return (
      `Halo ${name}! 👋\n\n` +
      `Invoice baru telah diterbitkan untuk Anda.\n\n` +
      `📄 No. Invoice: *${invoiceNo}*\n` +
      `💰 Jumlah: *${rp}*${due}${link}\n\n` +
      `Silakan cek portal klien untuk detail dan konfirmasi pembayaran.` +
      FOOTER
    );
  },

  invoiceReminder(
    name: string,
    invoiceNo: string,
    amount: number,
    dueDate: Date,
    paymentUrl: string | null,
    daysLeft: number,
  ) {
    const rp = `Rp ${amount.toLocaleString("id-ID")}`;
    const due = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dueDate);

    let title = "";
    if (daysLeft > 0) title = `Tagihan Anda jatuh tempo dalam ${daysLeft} hari`;
    else if (daysLeft === 0) title = "Tagihan Anda jatuh tempo *HARI INI*";
    else title = "Tagihan Anda telah *melewati jatuh tempo*";

    const link = paymentUrl ? `\n\n💳 Bayar sekarang:\n${paymentUrl}` : "";

    return (
      `Halo ${name}! 👋\n\n` +
      `${title}.\n\n` +
      `📄 No. Invoice: *${invoiceNo}*\n` +
      `💰 Jumlah: *${rp}*\n` +
      `📅 Jatuh tempo: ${due}${link}\n\n` +
      `Silakan abaikan jika sudah melakukan pembayaran.` +
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

  prospectCold(businessName: string) {
    return (
      `Halo, apakah ini *${businessName}*? 👋\n\n` +
      `Saya dari *MFWEB*, jasa pembuatan website profesional untuk bisnis lokal.\n\n` +
      `Kami melihat bisnis Anda belum memiliki website. Website bisa membantu:\n` +
      `✅ Muncul di pencarian Google\n` +
      `✅ Terlihat lebih profesional & terpercaya\n` +
      `✅ Dapat pelanggan baru 24 jam sehari\n\n` +
      `Mulai dari *Rp 800.000* saja, sudah termasuk desain premium & SEO dasar.\n\n` +
      `Bisa kita atur jadwal untuk membahas detail lebih lanjut? 🙏` +
      FOOTER
    );
  },

  hostingExpiry(
    name: string,
    domainName: string,
    expiryDate: Date,
    daysLeft: number,
    type: "domain" | "hosting" | "ssl",
  ) {
    const typeLabel =
      type === "domain" ? "Domain" : type === "hosting" ? "Hosting" : "SSL";
    const urgency =
      daysLeft <= 7
        ? "🔴 KRITIS"
        : daysLeft <= 14
          ? "🟡 SEGERA"
          : "⚠️ PERHATIAN";
    const expiry = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(expiryDate);
    const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    return (
      `Halo ${name}! 👋\n\n` +
      `${urgency} *${typeLabel} Website Anda Akan Expired!*\n\n` +
      `🌐 Domain: *${domainName}*\n` +
      `📋 Tipe: *${typeLabel}*\n` +
      `📅 Expired: *${expiry}*\n` +
      `⏳ Sisa: *${daysLeft} hari lagi*\n\n` +
      `Segera perpanjang agar website Anda tetap online dan dapat diakses oleh pelanggan Anda.\n\n` +
      `Balas pesan ini atau hubungi kami untuk bantuan perpanjangan.` +
      FOOTER
    );
  },
};
