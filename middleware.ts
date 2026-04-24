import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminProtected =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  const isPortalProtected =
    pathname.startsWith("/portal") &&
    !pathname.startsWith("/portal/login") &&
    !pathname.startsWith("/portal/register");

  if (!isAdminProtected && !isPortalProtected) {
    return NextResponse.next();
  }

  // Read JWT token directly — role is already embedded by lib/auth.ts jwt callback
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
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
