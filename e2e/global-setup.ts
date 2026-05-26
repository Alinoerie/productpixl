import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";
import { loadEnvLocal, playwrightBaseUrl } from "./helpers/env";

export default async function globalSetup() {
  loadEnvLocal();

  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("E2E setup: AUTH_SECRET missing — add to .env.local");
  }

  const email = process.env.E2E_TEST_EMAIL?.trim() ?? "alinoerie@gmail.com";
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, credits: true },
  });

  if (!user) {
    await prisma.$disconnect();
    throw new Error(`E2E setup: no user ${email} — sign in once via Google OAuth first`);
  }

  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name ?? user.email,
      credits: user.credits ?? 100,
    },
    secret,
    salt: "authjs.session-token",
  });

  const baseURL = playwrightBaseUrl();
  const { hostname, protocol } = new URL(baseURL);
  const authDir = resolve(process.cwd(), "e2e/.auth");
  mkdirSync(authDir, { recursive: true });

  writeFileSync(
    resolve(authDir, "user.json"),
    JSON.stringify(
      {
        cookies: [
          {
            name: "authjs.session-token",
            value: token,
            domain: hostname,
            path: "/",
            expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            httpOnly: true,
            secure: protocol === "https:",
            sameSite: "Lax",
          },
        ],
        origins: [],
      },
      null,
      2
    )
  );

  await prisma.$disconnect();
}
