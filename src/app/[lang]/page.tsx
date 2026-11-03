import {
  ArrowRight,
  ChartColumn,
  LockKeyhole,
  type LucideIcon,
  ShieldCheck,
  Target,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import dashboardEnDark from "@/assets/screenshots/dashboard-en-dark.png";
import dashboardEnLight from "@/assets/screenshots/dashboard-en-light.png";
import dashboardKmDark from "@/assets/screenshots/dashboard-km-dark.png";
import dashboardKmLight from "@/assets/screenshots/dashboard-km-light.png";
import { DemoButton } from "@/components/auth/demo-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { MarketingBackground } from "@/components/marketing-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { type Locale, localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { categoryColorVar } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export default async function Home() {
  const { locale, t } = await getI18n();
  const money = (cents: number) => formatMoney(cents, "USD", { locale, signDisplay: "always" });

  const track = (
    <FeatureCard
      icon={Wallet}
      tone="bg-emerald-500"
      title={t("landing.features.track.title")}
      text={t("landing.features.track.text")}
    >
      {/* A tiny transactions list, like the real one */}
      <ul className="bg-muted/60 grid gap-1.5 rounded-lg p-2.5 text-xs" aria-hidden>
        {(
          [
            ["groceries", "aqua", -9480],
            ["diningOut", "orange", -2341],
            ["salary", "green", 420000],
          ] as const
        ).map(([key, color, cents]) => (
          <li key={key} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: categoryColorVar(color) }}
            />
            <span className="flex-1 truncate">{t(`categoryNames.${key}`)}</span>
            <span className="font-medium tabular-nums">{money(cents)}</span>
          </li>
        ))}
      </ul>
    </FeatureCard>
  );

  const budgets = (
    <FeatureCard
      icon={Target}
      tone="bg-amber-500"
      title={t("landing.features.budgets.title")}
      text={t("landing.features.budgets.text")}
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
        <TriangleAlert className="size-3.5" aria-hidden />
        {t("landing.warningChip")}
      </span>
    </FeatureCard>
  );

  const insights = (
    <FeatureCard
      icon={ChartColumn}
      tone="bg-violet-500"
      title={t("landing.features.insights.title")}
      text={t("landing.features.insights.text")}
      aside={<Donut />}
    />
  );

  const privacy = (
    <FeatureCard
      icon={ShieldCheck}
      tone="bg-cyan-500"
      title={t("landing.features.privacy.title")}
      text={t("landing.features.privacy.text")}
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-200">
        <LockKeyhole className="size-3.5" aria-hidden />
        {t("landing.encryptedChip")}
      </span>
    </FeatureCard>
  );

  return (
    <div className="marketing-backdrop relative flex min-h-svh flex-col overflow-hidden">
      <MarketingBackground />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-4">
        <Logo href={localePath(locale, "/")} compactOnMobile />
        <nav className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href={localePath(locale, "/login")}
            className={buttonVariants({ variant: "outline", className: "bg-background/60" })}
          >
            {t("landing.login")}
          </Link>
          <Link href={localePath(locale, "/register")} className={buttonVariants()}>
            {t("landing.signup")}
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 pt-10 pb-20 md:pt-16">
        <section className="flex flex-col items-center gap-5 text-center">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            {t("landing.titleStart")}
            <span className="bg-linear-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent dark:from-teal-300 dark:to-cyan-300">
              {t("landing.titleHighlight")}
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-pretty">
            {t("landing.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={localePath(locale, "/register")}
              className={buttonVariants({
                size: "lg",
                className: "px-4 shadow-md shadow-teal-900/15",
              })}
            >
              {t("landing.getStarted")}
              <ArrowRight aria-hidden />
            </Link>
            <DemoButton size="lg" className="bg-background/70 px-4 backdrop-blur">
              {t("landing.tryDemo")}
            </DemoButton>
          </div>
        </section>

        {/* Phones: screenshot first, then the cards. Wide screens: cards around it. */}
        <section className="mt-14 grid items-center gap-6 lg:grid-cols-[1fr_1.75fr_1fr]">
          <div className="order-2 grid gap-6 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
            {track}
            {budgets}
          </div>
          <div className="order-1 lg:order-2">
            <HeroScreenshot locale={locale} alt={t("landing.screenshotAlt")} />
          </div>
          <div className="order-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {insights}
            {privacy}
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  tone,
  title,
  text,
  aside,
  children,
}: {
  icon: LucideIcon;
  /** Background color of the icon tile */
  tone: string;
  title: string;
  text: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="bg-card/85 grid gap-3 rounded-2xl border p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div className="flex gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
            tone,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="grid flex-1 gap-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm">{text}</p>
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** Decorative donut in the category colors (the real dashboard uses ranked bars) */
function Donut() {
  const segments = [
    { share: 0.4, color: 1 },
    { share: 0.25, color: 3 },
    { share: 0.2, color: 2 },
    { share: 0.15, color: 7 },
  ];
  const circumference = 2 * Math.PI * 14;
  let offset = 0;

  return (
    <svg viewBox="0 0 36 36" className="size-12 shrink-0 -rotate-90" aria-hidden>
      {segments.map(({ share, color }) => {
        const length = share * circumference;
        const circle = (
          <circle
            key={color}
            cx="18"
            cy="18"
            r="14"
            fill="none"
            strokeWidth="6"
            stroke={`var(--series-${color})`}
            // A small gap between segments
            strokeDasharray={`${length - 2} ${circumference - length + 2}`}
            strokeDashoffset={-offset}
          />
        );
        offset += length;
        return circle;
      })}
    </svg>
  );
}

// Imported (not served from /public) so each version gets a content-hashed URL:
// an updated screenshot can never be served from a stale image cache.
const SCREENSHOTS = {
  en: { light: dashboardEnLight, dark: dashboardEnDark },
  km: { light: dashboardKmLight, dark: dashboardKmDark },
} as const;

/** A real screenshot of the dashboard, tilted in 3D on wide screens (flat on hover) */
function HeroScreenshot({ locale, alt }: { locale: Locale; alt: string }) {
  const sizes = "(min-width: 1024px) 620px, 100vw";
  return (
    <div className="[perspective:1800px]">
      <div className="bg-card rounded-2xl border p-1.5 shadow-2xl shadow-teal-950/25 transition-transform duration-700 ease-out lg:[transform:rotateX(18deg)_rotateY(-10deg)_rotateZ(5deg)] lg:hover:[transform:none]">
        <Image
          src={SCREENSHOTS[locale].light}
          alt={alt}
          placeholder="blur"
          sizes={sizes}
          priority
          className="rounded-xl dark:hidden"
        />
        <Image
          src={SCREENSHOTS[locale].dark}
          alt={alt}
          sizes={sizes}
          className="hidden rounded-xl dark:block"
        />
      </div>
    </div>
  );
}
