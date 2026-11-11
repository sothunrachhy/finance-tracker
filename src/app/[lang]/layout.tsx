import type { Metadata } from "next";
import { Geist, Geist_Mono, Kantumruy_Pro } from "next/font/google";
import dashboardEn from "@/assets/screenshots/dashboard-en-light.png";
import dashboardKm from "@/assets/screenshots/dashboard-km-light.png";
import { InlineScript } from "@/components/inline-script";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/client";
import { LOCALES } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { siteUrl } from "@/lib/app-url";
import { themeScript } from "@/lib/theme";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

// Geist has no Khmer glyphs; the browser falls back to Kantumruy Pro for them.
const khmer = Kantumruy_Pro({
  variable: "--font-khmer",
  subsets: ["khmer"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Prerender every page in both languages
export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const screenshot = locale === "km" ? dashboardKm : dashboardEn;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("meta.appName"), template: `%s · ${t("meta.appName")}` },
    description: t("meta.description"),
    // Link previews in chat apps and social posts
    openGraph: {
      type: "website",
      siteName: t("meta.appName"),
      title: t("meta.appName"),
      description: t("meta.description"),
      locale: locale === "km" ? "km_KH" : "en_US",
      images: [{ url: screenshot.src, width: screenshot.width, height: screenshot.height }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, dictionary } = await getI18n();

  return (
    // suppressHydrationWarning: the theme script adds the "dark" class before React hydrates
    <html
      lang={locale}
      className={`${geistSans.variable} ${khmer.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <I18nProvider locale={locale} dictionary={dictionary}>
          {children}
          <Toaster richColors closeButton />
        </I18nProvider>
      </body>
    </html>
  );
}
