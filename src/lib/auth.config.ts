import type { NextAuthConfig } from "next-auth";

/** Edge-safe config for middleware — no Email provider (avoids nodemailer in edge bundle). */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/studio",
    verifyRequest: "/login/check-email",
  },
  providers: [],
  callbacks: {
    authorized() {
      return true;
    },
  },
} satisfies NextAuthConfig;
