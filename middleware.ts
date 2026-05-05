import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const role = (session?.user as { role?: string })?.role;

  const isAdminRoute  = nextUrl.pathname.startsWith("/admin");
  const isPortalRoute = nextUrl.pathname.startsWith("/portal");
  const isAdminApi    = nextUrl.pathname.startsWith("/api/admin");
  const isPortalApi   = nextUrl.pathname.startsWith("/api/portal");

  // Protect /admin pages
  if (isAdminRoute && !nextUrl.pathname.startsWith("/admin/login")) {
    if (!isLoggedIn || role !== "ADMIN") {
      return Response.redirect(new URL("/admin/login", nextUrl));
    }
  }

  // Protect /portal pages (except login/register/reset-password)
  const portalPublic = ["/portal/login", "/portal/register", "/portal/reset-password"];
  if (isPortalRoute && !portalPublic.some((p) => nextUrl.pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/portal/login", nextUrl));
    }
  }

  // Protect /api/admin — return 401 for API calls
  if (isAdminApi) {
    if (!isLoggedIn || role !== "ADMIN") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Protect /api/portal — return 401 for API calls
  const portalApiPublic = [
    "/api/portal/register",
    "/api/portal/reset-password",
  ];
  if (isPortalApi && !portalApiPublic.some((p) => nextUrl.pathname.startsWith(p))) {
    if (!isLoggedIn) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/api/admin/:path*",
    "/api/portal/:path*",
  ],
};
