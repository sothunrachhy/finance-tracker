import type { MetadataRoute } from "next";
import { localePath, LOCALES } from "@/i18n/config";
import { siteUrl } from "@/lib/app-url";

// The public pages, each listed in every language with links to its translations
const PUBLIC_PATHS = ["/", "/register", "/login"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PUBLIC_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${base}${localePath(locale, path)}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((other) => [other, `${base}${localePath(other, path)}`]),
        ),
      },
    })),
  );
}
