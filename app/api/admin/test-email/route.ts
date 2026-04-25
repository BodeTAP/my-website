import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Resend } from "resend";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.AUTH_RESEND_KEY;
  const from   = process.env.EMAIL_FROM ?? "noreply@mfweb.com";
  const to     = session.user!.email!;

  if (!apiKey) {
    return NextResponse.json({ error: "AUTH_RESEND_KEY tidak ada di environment variables" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from,
    to,
    subject: "Test Email MFWEB",
    html: "<p>Ini adalah email test dari sistem MFWEB. Jika Anda menerima ini, konfigurasi email sudah benar.</p>",
  });

  return NextResponse.json({
    from,
    to,
    apiKeyPrefix: apiKey.slice(0, 8) + "...",
    resendResponse: result,
  });
}
