import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { getAuthProviders } from "./auth-providers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: getAuthProviders(),
  adapter: PrismaAdapter(prisma),
  // JWT so middleware + server both read the same session cookie (DB adapter still stores users/accounts)
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: 10 },
        });
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session: jwtSession }) {
      if (user?.id) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { credits: true, image: true },
        });
        token.credits = dbUser?.credits ?? 10;
        if (dbUser?.image) token.picture = dbUser.image;
      }
      if (trigger === "update" && jwtSession?.credits !== undefined) {
        token.credits = jwtSession.credits;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
        session.user.credits = (token.credits as number | undefined) ?? 10;
        if (typeof token.picture === "string") {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      credits?: number;
    } & DefaultSession["user"];
  }
}

import type { DefaultSession } from "next-auth";
