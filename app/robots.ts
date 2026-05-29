import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/dashboard", "/generate", "/copy", "/projects", "/products/", "/account", "/onboarding", "/brand", "/brands", "/api/"],
    },
    sitemap: "https://productpixl.vercel.app/sitemap.xml",
  };
}
