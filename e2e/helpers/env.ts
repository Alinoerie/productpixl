import { readFileSync } from "fs";
import { resolve } from "path";

/** Load .env.local for Playwright global setup (mirrors api-smoke-test). */
export function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local optional in CI when env vars injected directly
  }
}

export function playwrightBaseUrl() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
}
