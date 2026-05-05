import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Portal API routes that are publicly accessible (no auth required)
const PORTAL_API_PUBLIC = [
  "/api/portal/register",
  "/api/portal/reset-password",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  const isPortalPage =
    pathname.startsWith("/portal") &&
    !pathname.startsWith("/portal/login") &&
    !pathname.startsWith("/portal/register") &&
    !pathname.startsWith("/portal/reset-password");

  const isAdminApi = pathname.startsWith("/api/admin");

  const isPortalApi =
    pathname.startsWith("/api/portal") &&
    !PORTAL_API_PUBLIC.some((p) => pathname.startsWith(p));

  // Onboarding forms are public (accessed via token)
  if (pathname.startsWith("/onboarding")) {
    return NextResponse.next();
  }

  const needsAuth = isAdminPage || isPortalPage || isAdminApi || isPortalApi;
  if (!needsAuth) {
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

  // Admin page/API: require ADMIN role
  if ((isAdminPage || isAdminApi) && token?.role !== "ADMIN") {
    if (isAdminApi) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Portal page/API: require any authenticated user
  if ((isPortalPage || isPortalApi) && !token) {
    if (isPortalApi) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return NextResponse.redirect(new URL("/portal/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/onboarding/:path*",
    "/api/admin/:path*",
    "/api/portal/:path*",
  ],
};
