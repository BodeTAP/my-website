import type { NextAuthConfig } from "next-auth";

// Edge-compatible base config — no Prisma/bcrypt imports.
// Callbacks are defined in lib/auth.ts (with DB access); middleware only reads the JWT cookie.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/portal/login",
    error: "/portal/login",
  },
  providers: [],
};
