import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const key = process.env.AUTH_RESEND_KEY;
    if (!key) throw new Error("AUTH_RESEND_KEY env var is not set");
    _resend = new Resend(key);
  }
  return _resend;
}
const FROM   = process.env.EMAIL_FROM ?? "noreply@mfweb.com";
const SITE   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mfweb.maffisorp.id";

function base(title: string, body: string) {
  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 20px">
    <table width="560" cellpadding="0" cellspacing="0"
      style="background:#ffffff;border-radius:12px;overflow:hidden;
             box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <tr>
        <td style="background:#1e40af;padding:28px 32px;text-align:center">
          <p style="color:#bfdbfe;margin:0;font-size:12px;letter-spacing:2px;
                    text-transform:uppercase">Portal Klien</p>
          <h1 style="color:#ffffff;margin:6px 0 0;font-size:26px;font-weight:bold">
            MFWEB</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px">
          <h2 style="color:#0f172a;margin:0 0 16px;font-size:20px">${title}</h2>
          ${body}
        </td>
      </tr>
      <tr>
        <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0">
          <p style="color:#94a3b8;margin:0;font-size:12px;text-align:center">
            © MFWEB · Solusi Website Profesional ·
            <a href="${SITE}" style="color:#60a5fa;text-decoration:none">${SITE}</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table></body></html>`;
}

function btn(label: string, url: string) {
  return `<div style="text-align:center;margin:28px 0">
    <a href="${url}" style="background:#1e40af;color:#ffffff;padding:13px 30px;
       border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;
       display:inline-block">${label}</a></div>`;
}

function p(text: string) {
  return `<p style="color:#475569;margin:0 0 16px;font-size:15px;line-height:1.7">${text}</p>`;
}

function info(rows: [string, string][]) {
  const cells = rows.map(([k, v]) =>
    `<tr>
      <td style="padding:10px 14px;color:#64748b;font-size:13px;width:40%;
                 border-bottom:1px solid #f1f5f9">${k}</td>
      <td style="padding:10px 14px;color:#0f172a;font-size:13px;font-weight:600;
                 border-bottom:1px solid #f1f5f9">${v}</td>
    </tr>`
  ).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0"
    style="background:#f8fafc;border-radius:8px;margin:20px 0;overflow:hidden">
    ${cells}</table>`;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRp(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    DRAFTING: "Desain",
    DEVELOPMENT: "Development",
    TESTING: "Testing & QA",
    LIVE: "🎉 Live!",
  };
  return map[s] ?? s;
}

// ── Email functions ─────────────────────────────────────────────────────────

/** Password reset — sent to portal client */
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${SITE}/portal/reset-password/${token}`;
  const html = base(
    "Reset Password Akun Anda",
    p(`Halo <strong>${name}</strong>,`) +
    p("Kami menerima permintaan reset password untuk akun Anda di portal MFWEB. Klik tombol di bawah untuk membuat password baru.") +
    btn("Reset Password Sekarang", url) +
    `<p style="color:#94a3b8;margin:0;font-size:13px;line-height:1.6">
      Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini — akun Anda tetap aman.
    </p>`
  );
  await getResend().emails.send({ from: FROM, to: email, subject: "Reset Password — MFWEB Portal", html });
}

/** Invoice created — sent to client when admin creates invoice */
export async function sendInvoiceCreatedEmail(
  email: string,
  clientName: string,
  invoiceNo: string,
  amount: number,
  dueDate?: Date | null,
) {
  const rows: [string, string][] = [
    ["Nomor Invoice", invoiceNo],
    ["Jumlah Tagihan", formatRp(amount)],
  ];
  if (dueDate) rows.push(["Jatuh Tempo", new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(dueDate)]);

  const html = base(
    `Invoice Baru: ${invoiceNo}`,
    p(`Halo <strong>${clientName}</strong>,`) +
    p("Invoice baru telah dibuat untuk Anda. Berikut detail tagihannya:") +
    info(rows) +
    btn("Lihat Invoice & Unduh PDF", `${SITE}/portal/invoices`) +
    p(`Setelah melakukan pembayaran, mohon konfirmasi via WhatsApp agar kami dapat segera memproses. Terima kasih.`)
  );
  await getResend().emails.send({ from: FROM, to: email, subject: `Invoice ${invoiceNo} — MFWEB`, html });
}

/** Project status updated — sent to client */
export async function sendProjectStatusEmail(
  email: string,
  clientName: string,
  projectName: string,
  status: string,
) {
  const label = statusLabel(status);
  const isLive = status === "LIVE";
  const html = base(
    `Update Proyek: ${projectName}`,
    p(`Halo <strong>${clientName}</strong>,`) +
    p(`Ada kabar terbaru untuk proyek Anda. Status proyek <strong>${projectName}</strong> telah diperbarui:`) +
    info([["Proyek", projectName], ["Status Terkini", label]]) +
    (isLive
      ? p("🎉 <strong>Selamat! Website Anda sudah live!</strong> Segera cek dan beritahu kami jika ada yang ingin disesuaikan.")
      : p("Kami terus mengerjakan proyek Anda. Pantau perkembangan terbaru di dashboard portal.")) +
    btn("Lihat Dashboard", `${SITE}/portal/dashboard`)
  );
  await getResend().emails.send({ from: FROM, to: email, subject: `Update Proyek: ${projectName} — MFWEB`, html });
}

/** Admin replied to ticket — sent to client */
export async function sendTicketReplyToClientEmail(
  email: string,
  clientName: string,
  ticketSubject: string,
  message: string,
) {
  const html = base(
    "Tim MFWEB Membalas Tiket Anda",
    p(`Halo <strong>${clientName}</strong>,`) +
    p(`Tim MFWEB telah membalas tiket <strong>"${ticketSubject}"</strong>:`) +
    `<div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:16px 20px;
                 border-radius:0 8px 8px 0;margin:16px 0">
       <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.7">${message.replace(/\n/g, "<br>")}</p>
     </div>` +
    btn("Lihat & Balas Tiket", `${SITE}/portal/tickets`)
  );
  await getResend().emails.send({ from: FROM, to: email, subject: `Balasan Tiket: ${ticketSubject} — MFWEB`, html });
}

/** Client sent a ticket message — sent to admin */
export async function sendTicketReplyToAdminEmail(
  adminEmail: string,
  clientName: string,
  ticketSubject: string,
  message: string,
  ticketId: string,
) {
  const html = base(
    "Pesan Baru dari Klien",
    p(`Klien <strong>${clientName}</strong> mengirim pesan pada tiket <strong>"${ticketSubject}"</strong>:`) +
    `<div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:16px 20px;
                 border-radius:0 8px 8px 0;margin:16px 0">
       <p style="margin:0;color:#0f172a;font-size:14px;line-height:1.7">${message.replace(/\n/g, "<br>")}</p>
     </div>` +
    btn("Balas di Dashboard Admin", `${SITE}/admin/tickets/${ticketId}`)
  );
  await getResend().emails.send({ from: FROM, to: adminEmail, subject: `[Tiket] ${clientName}: ${ticketSubject}`, html });
}

/** New ticket opened by client — sent to admin */
export async function sendNewTicketToAdminEmail(
  adminEmail: string,
  clientName: string,
  ticketSubject: string,
  ticketId: string,
) {
  const html = base(
    "Tiket Support Baru",
    p(`Klien <strong>${clientName}</strong> membuka tiket support baru:`) +
    info([["Subjek", ticketSubject], ["Klien", clientName]]) +
    btn("Lihat Tiket", `${SITE}/admin/tickets/${ticketId}`)
  );
  await getResend().emails.send({ from: FROM, to: adminEmail, subject: `[Tiket Baru] ${ticketSubject}`, html });
}
