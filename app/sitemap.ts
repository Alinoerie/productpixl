import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

const PUBLIC_PATHS = [
  "",
  "/how-it-works",
  "/gallery",
  "/grader",
  "/compare",
  "/pricing",
  "/faq",
  "/marketplaces",
  "/guides/ecommerce",
  "/demo",
  "/privacy",
  "/terms",
  "/login",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl().replace(/\/$/, "");
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/pricing" || path === "/grader" ? 0.9 : 0.7,
  }));
}
