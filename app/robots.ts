import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/.next/",
    },
    sitemap: "https://alone-christmas.me/sitemap.xml",
  };
}
