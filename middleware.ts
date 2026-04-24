import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as { role?: string })?.role;
  const isLoggedIn = !!req.auth;

  const isAdminProtected =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  const isPortalProtected =
    pathname.startsWith("/portal") &&
    !pathname.startsWith("/portal/login") &&
    !pathname.startsWith("/portal/register");

  if (isAdminProtected && role !== "ADMIN") {
    return Response.redirect(new URL("/admin/login", req.url));
  }

  if (isPortalProtected && !isLoggedIn) {
    return Response.redirect(new URL("/portal/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
