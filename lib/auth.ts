import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    Resend({
      from: process.env.EMAIL_FROM ?? "noreply@mfweb.com",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create Client record for first-time Google sign-ins
      if (account?.provider === "google" && user.id) {
        const existing = await prisma.client.findUnique({ where: { userId: user.id } });
        if (!existing) {
          await prisma.client.create({
            data: {
              userId: user.id,
              businessName: user.name ?? "Klien Baru",
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      // PrismaAdapter may not include custom fields in OAuth user object — fetch from DB on first sign-in
      if (account && !token.role && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        token.role = dbUser?.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
