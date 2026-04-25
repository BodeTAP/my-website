import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminProtected =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  const isPortalProtected =
    pathname.startsWith("/portal") &&
    !pathname.startsWith("/portal/login") &&
    !pathname.startsWith("/portal/register") &&
    !pathname.startsWith("/portal/reset-password");

  if (!isAdminProtected && !isPortalProtected) {
    return NextResponse.next();
  }

  // NextAuth v5 encrypts JWT using cookie name as salt — must match exactly
  const secure = req.nextUrl.protocol === "https:";
  const cookieName = secure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName,
    salt: cookieName,
  });

  if (isAdminProtected && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isPortalProtected && !token) {
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
