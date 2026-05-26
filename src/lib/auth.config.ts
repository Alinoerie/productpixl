import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const protectedPrefixes = [
  "/dashboard",
  "/generate",
  "/copy",
  "/products",
  "/account",
  "/brand",
  "/brands",
];

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isProtected = protectedPrefixes.some((p) =>
        nextUrl.pathname.startsWith(p)
      );
      if (isProtected) return !!auth?.user;
      return true;
    },
  },
} satisfies NextAuthConfig;
