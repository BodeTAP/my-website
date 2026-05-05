/**
 * WhatsApp message templates — pure functions, no Node.js dependencies.
 * Safe to import in both Server and Client Components.
 *
 * For sending WA messages (server-side only), use sendWA() from lib/whatsapp.ts.
 */

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
