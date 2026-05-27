export function siteUrl() {
  const fromEnv = process.env.AUTH_URL?.trim();
  return fromEnv || "https://productpixl.vercel.app";
}
