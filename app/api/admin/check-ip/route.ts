import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch our own outgoing IP from a public IP checker
  const res = await fetch("https://api.ipify.org?format=json");
  const { ip } = await res.json();

  return NextResponse.json({
    outgoingIP: ip,
    note: "IP ini bisa berubah sewaktu-waktu karena Vercel serverless tidak menjamin IP statis.",
  });
}
