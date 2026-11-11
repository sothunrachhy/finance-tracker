import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { siteUrl } from "@/lib/app-url";

const PRIVATE_PATHS = ["/dashboard", "/transactions", "/categories", "/budgets", "/settings"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in pages only show a login form to crawlers; API routes return data
      disallow: [
        "/api/",
        "/logout",
        ...LOCALES.flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}${path}`)),
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
