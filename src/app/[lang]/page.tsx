import { ArrowRight, Check, Plus } from "lucide-react";
import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import heroBackground from "@/assets/landing/hero-background.webp";
import waves from "@/assets/landing/waves.webp";
import dashboardEnDark from "@/assets/screenshots/dashboard-en-dark.png";
import dashboardEnLight from "@/assets/screenshots/dashboard-en-light.png";
import dashboardKmDark from "@/assets/screenshots/dashboard-km-dark.png";
import dashboardKmLight from "@/assets/screenshots/dashboard-km-light.png";
import { DemoButton } from "@/components/auth/demo-button";
import { HeroVisual } from "@/components/landing/hero-visual";
import {
  BriefcaseIcon,
  ChartBarIcon,
  CloudIcon,
  CoinIcon,
  DiamondIcon,
  DownloadIcon,
  EyeIcon,
  FlashIcon,
  ForkKnifeIcon,
  HomeIcon,
  type IconComponent,
  LeafIcon,
  LockIcon,
  PlayCircleIcon,
  RefreshIcon,
  RocketIcon,
  ShieldIcon,
  ShoppingCartIcon,
  TranslateIcon,
} from "@/components/icons/mingcute";
import { PhoneIllustration } from "@/components/landing/phone-illustration";
import { SectionNav } from "@/components/landing/section-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { MarketingBackground } from "@/components/marketing-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { LOCALE_NAMES, localePath, LOCALES } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { categoryColorVar } from "@/lib/categories";
import { cn } from "@/lib/utils";

const SOURCE_URL = "https://github.com/sothunrachhy/finance-tracker";

// Imported (not served from /public) so each version gets a content-hashed URL:
// an updated screenshot can never be served from a stale image cache.
const SCREENSHOTS = {
  en: { light: dashboardEnLight, dark: dashboardEnDark },
  km: { light: dashboardKmLight, dark: dashboardKmDark },
} as const;

/** The main call to action. White text stays above 5:1 across the whole gradient. */
const PRIMARY_PILL =
  "inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-teal-800 to-emerald-700 font-semibold text-white shadow-lg shadow-emerald-800/25 transition hover:brightness-110 focus-visible:ring-3 focus-visible:ring-teal-500/50 focus-visible:outline-none";

const WHITE_PILL =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white font-semibold text-landing-ink shadow-md shadow-slate-900/5 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15";

const FEATURES = [
  {
    key: "track",
    icon: RefreshIcon,
    tone: "from-emerald-400 to-emerald-600 shadow-emerald-500/30",
  },
  { key: "budgets", icon: ShieldIcon, tone: "from-sky-400 to-blue-600 shadow-blue-500/30" },
  {
    key: "insights",
    icon: ChartBarIcon,
    tone: "from-violet-400 to-purple-600 shadow-purple-500/30",
  },
  { key: "export", icon: DownloadIcon, tone: "from-amber-400 to-orange-500 shadow-orange-500/30" },
  { key: "sync", icon: CloudIcon, tone: "from-teal-300 to-cyan-500 shadow-cyan-500/30" },
  { key: "security", icon: LockIcon, tone: "from-green-400 to-emerald-600 shadow-green-500/30" },
] as const;

const ABOUT = [
  { key: "cents", icon: CoinIcon, tone: "from-emerald-400 to-teal-600 shadow-emerald-500/30" },
  { key: "languages", icon: TranslateIcon, tone: "from-sky-400 to-blue-600 shadow-blue-500/30" },
  {
    key: "accessible",
    icon: EyeIcon,
    tone: "from-violet-400 to-purple-600 shadow-purple-500/30",
  },
] as const;

const FAQ_ITEMS = ["free", "demo", "security", "export", "delete"] as const;

export default async function Home() {
  const { locale, t } = await getI18n();
  const register = localePath(locale, "/register");
  const free = t("landing.pricing.price");
  const screenshots = SCREENSHOTS[locale];

  const sections = (["home", "features", "pricing", "about", "faq"] as const).map((id) => ({
    id,
    label: t(`landing.nav.${id}`),
  }));

  return (
    <div className="bg-landing text-landing-ink relative flex min-h-svh flex-col overflow-x-clip">
      {/* Behind the header and hero: mint waves in light mode, drifting glows in dark mode */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[58rem]">
        <Image
          src={heroBackground}
          alt=""
          fill
          preload
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-top dark:hidden"
        />
        <div className="hidden dark:block">
          <MarketingBackground />
        </div>
        <div className="from-landing absolute inset-x-0 bottom-0 h-64 bg-linear-to-t to-transparent" />
      </div>

      <header className="bg-landing/70 sticky top-0 z-40 border-b border-white/60 backdrop-blur-xl dark:border-white/5">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 md:grid md:grid-cols-[1fr_auto_1fr] lg:h-18">
          <Logo href={localePath(locale, "/")} compactOnMobile className="text-lg" />
          <SectionNav sections={sections} label={t("landing.sections")} />
          <div className="flex items-center gap-1 justify-self-end sm:gap-2">
            <LanguageSwitcher showName className="rounded-full" />
            <ThemeToggle />
            <Link
              href={localePath(locale, "/login")}
              className={cn(WHITE_PILL, "h-9 px-3 text-sm font-medium shadow-sm sm:px-4")}
            >
              {t("landing.login")}
            </Link>
            <Link href={register} className={cn(PRIMARY_PILL, "h-9 px-3 text-sm sm:px-4")}>
              {t("landing.signup")}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        <section
          id="home"
          className="mx-auto grid w-full max-w-7xl scroll-mt-20 items-center gap-10 px-4 pt-10 pb-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pt-16 lg:pb-12"
        >
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-3.5 py-1.5 text-xs font-semibold text-teal-800 shadow-sm backdrop-blur sm:text-sm dark:border-emerald-400/20 dark:bg-white/5 dark:text-teal-200">
              <FlashIcon className="size-4 text-emerald-500" />
              {t("landing.eyebrow")}
            </span>
            <h1 className="text-[2.6rem] leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl lg:text-[3.6rem] xl:text-[4rem] [&:lang(km)]:leading-[1.4]">
              <Highlight
                text={t("landing.title")}
                className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-300 dark:to-teal-300"
              />
            </h1>
            <p className="max-w-lg text-lg text-pretty text-slate-600 sm:text-xl dark:text-slate-300">
              {t("landing.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href={register} className={cn(PRIMARY_PILL, "h-12 px-6 text-base")}>
                <RocketIcon className="size-4.5" />
                {t("landing.getStarted")}
                <ArrowRight className="size-4.5" aria-hidden />
              </Link>
              <DemoButton icon={PlayCircleIcon} className={cn(WHITE_PILL, "h-12 px-6 text-base")}>
                {t("landing.tryDemo")}
              </DemoButton>
            </div>
            <FreeNote text={t("landing.freeNote")} />
          </div>
          <HeroVisual
            light={screenshots.light}
            dark={screenshots.dark}
            alt={t("landing.screenshotAlt")}
          />
        </section>

        <section
          id="features"
          aria-labelledby="features-heading"
          className="relative scroll-mt-20 px-4 pt-12 pb-16 lg:pt-16 lg:pb-20"
        >
          <Glow className="top-0 -right-64" />
          <SectionHeading
            id="features"
            label={t("landing.features.label")}
            heading={t("landing.features.heading")}
            intro={t("landing.features.intro")}
          />
          <div className="relative mx-auto mt-14 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ key, icon, tone }) => {
              const title = t(`landing.features.${key}.title`);
              return (
                <Link
                  key={key}
                  href={register}
                  aria-label={t("landing.features.cardLink", { title })}
                  className="landing-card group grid content-start gap-5 rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgb(13_94_84/0.35)]"
                >
                  <IconTile icon={icon} tone={tone} />
                  <div className="flex items-center gap-4">
                    <div className="grid flex-1 gap-1.5">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {t(`landing.features.${key}.text`)}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors group-hover:bg-teal-700 group-hover:text-white dark:bg-white/10 dark:text-slate-200"
                    >
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          className="relative scroll-mt-20 px-4 py-16 lg:py-20"
        >
          <Glow className="top-1/4 -left-72" />
          <SectionHeading
            id="pricing"
            label={t("landing.pricing.label")}
            heading={t("landing.pricing.heading")}
            intro={t("landing.pricing.intro")}
          />
          <div className="relative mx-auto mt-16 grid max-w-4xl items-center gap-10 md:grid-cols-2 md:gap-6">
            <PlanCard
              icon={LeafIcon}
              tone="from-emerald-300 to-emerald-500 shadow-emerald-400/30"
              name={t("landing.pricing.demo.name")}
              description={t("landing.pricing.demo.description")}
              price={free}
              period={t("landing.pricing.demo.period")}
              features={[
                t("landing.pricing.demo.features.data"),
                t("landing.pricing.demo.features.all"),
                t("landing.pricing.demo.features.expiry"),
              ]}
            >
              <DemoButton icon={PlayCircleIcon} className={cn(WHITE_PILL, "h-11 w-full text-sm")}>
                {t("landing.pricing.demo.cta")}
              </DemoButton>
            </PlanCard>
            <PlanCard
              badge={t("landing.pricing.recommended")}
              icon={DiamondIcon}
              tone="from-teal-300 to-teal-600 shadow-teal-500/30"
              name={t("landing.pricing.personal.name")}
              description={t("landing.pricing.personal.description")}
              price={free}
              period={t("landing.pricing.personal.period")}
              features={[
                t("landing.pricing.personal.features.unlimited"),
                t("landing.pricing.personal.features.budgets"),
                t("landing.pricing.personal.features.charts"),
                t("landing.pricing.personal.features.export"),
                t("landing.pricing.personal.features.sync"),
              ]}
            >
              <Link href={register} className={cn(PRIMARY_PILL, "h-11 w-full text-sm")}>
                {t("landing.pricing.personal.cta")}
              </Link>
            </PlanCard>
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className="relative scroll-mt-20 px-4 py-16 lg:py-20"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <SectionHeading
              id="about"
              align="start"
              label={t("landing.about.label")}
              heading={t("landing.about.heading")}
              intro={t("landing.about.text")}
            />
            <ul className="grid gap-4">
              {ABOUT.map(({ key, icon, tone }) => (
                <li key={key} className="landing-card flex items-start gap-4 rounded-3xl p-5">
                  <IconTile icon={icon} tone={tone} size="sm" />
                  <div className="grid gap-1">
                    <h3 className="font-semibold">{t(`landing.about.${key}.title`)}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t(`landing.about.${key}.text`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="relative scroll-mt-20 px-4 py-16 lg:py-20"
        >
          <Glow className="-right-72 bottom-0" />
          <SectionHeading
            id="faq"
            label={t("landing.faq.label")}
            heading={t("landing.faq.heading")}
          />
          <div className="landing-card relative mx-auto mt-12 max-w-3xl divide-y divide-slate-200/70 rounded-3xl dark:divide-white/10">
            {FAQ_ITEMS.map((key) => (
              <details key={key} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold transition-colors hover:text-teal-700 dark:hover:text-teal-300 [&::-webkit-details-marker]:hidden">
                  {t(`landing.faq.items.${key}.q`)}
                  <span className="bg-mint flex size-8 shrink-0 items-center justify-center rounded-full text-teal-800 transition-transform group-open:rotate-45 dark:text-teal-200">
                    <Plus className="size-4" aria-hidden />
                  </span>
                </summary>
                <p className="px-6 pb-6 text-pretty text-slate-600 dark:text-slate-300">
                  {t(`landing.faq.items.${key}.a`)}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pt-12 pb-20 lg:pt-20">
          <div className="relative mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-r from-teal-800 via-teal-700 to-emerald-500 px-6 py-14 shadow-2xl shadow-teal-900/25 sm:px-12 lg:py-20">
              <Image
                src={waves}
                alt=""
                fill
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover object-bottom opacity-60 mix-blend-soft-light"
              />
              <div
                aria-hidden
                className="absolute -right-16 -bottom-32 size-[30rem] rounded-full bg-emerald-200/40 blur-3xl"
              />
              <div className="relative grid max-w-xl justify-items-center gap-5 text-center text-white lg:justify-items-start lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-tight [&:lang(km)]:leading-normal">
                  {t("landing.cta.heading")}
                </h2>
                <p className="text-lg text-teal-50">{t("landing.cta.text")}</p>
                <Link
                  href={register}
                  className="hover:bg-mint mt-1 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-teal-900 shadow-lg shadow-teal-950/20 transition-colors"
                >
                  {t("landing.getStarted")}
                  <ArrowRight className="size-4.5" aria-hidden />
                </Link>
              </div>
            </div>
            <PhoneIllustration className="absolute right-8 -bottom-2 hidden lg:block xl:right-20" />
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden border-t border-slate-200/70 dark:border-white/10">
        <Image
          src={waves}
          alt=""
          fill
          sizes="100vw"
          className="[mask-image:linear-gradient(to_top,black,transparent_75%)] object-cover object-bottom opacity-25 dark:hidden"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
          <div className="grid content-start gap-3 sm:col-span-3 lg:col-span-1">
            <Logo href={localePath(locale, "/")} className="text-lg" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("landing.footer.tagline")}
            </p>
          </div>
          <FooterColumn title={t("landing.footer.product")}>
            {(["features", "pricing", "about", "faq"] as const).map((id) => (
              <FooterLink key={id} href={`#${id}`}>
                {t(`landing.nav.${id}`)}
              </FooterLink>
            ))}
          </FooterColumn>
          <FooterColumn title={t("landing.footer.account")}>
            <FooterLink href={register}>{t("landing.footer.createAccount")}</FooterLink>
            <FooterLink href={localePath(locale, "/forgot-password")}>
              {t("landing.footer.resetPassword")}
            </FooterLink>
          </FooterColumn>
          <FooterColumn title={t("landing.footer.language")}>
            {LOCALES.map((option) => (
              <FooterLink key={option} href={localePath(option, "/")} lang={option}>
                {LOCALE_NAMES[option]}
              </FooterLink>
            ))}
          </FooterColumn>
          <div>
            <a
              href={SOURCE_URL}
              aria-label={t("landing.footer.source")}
              title={t("landing.footer.source")}
              className="hover:text-landing-ink flex size-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors dark:bg-white/10 dark:text-slate-200 dark:ring-white/10"
            >
              <GitHubMark className="size-5" />
            </a>
          </div>
        </div>
        <div className="relative border-t border-slate-200/70 dark:border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
            <p>
              <Copyright template={t("landing.footer.copyright")} />
            </p>
            <p>{t("landing.footer.madeWith")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Renders "plain *highlighted* plain" text, wrapping the starred parts in a span */
function Highlight({ text, className }: { text: string; className: string }) {
  return text.split("*").map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className={className}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Fills in the current year. Cached for a day so the page can still be prerendered. */
async function Copyright({ template }: { template: string }) {
  "use cache";
  cacheLife("days");
  return template.replace("{year}", String(new Date().getFullYear()));
}

const NOTE_ICONS = [
  [ShoppingCartIcon, "aqua"],
  [ForkKnifeIcon, "orange"],
  [HomeIcon, "blue"],
  [BriefcaseIcon, "green"],
] as const;

/** Category bubbles next to a short "it's free" note, under the hero buttons */
function FreeNote({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2" aria-hidden>
        {NOTE_ICONS.map(([Icon, color]) => (
          <span
            key={color}
            className="dark:ring-landing flex size-9 items-center justify-center rounded-full text-white shadow-sm ring-2 ring-white"
            style={{ backgroundColor: categoryColorVar(color) }}
          >
            <Icon className="size-4" />
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        <Highlight text={text} className="text-landing-ink font-semibold" />
      </p>
    </div>
  );
}

function SectionHeading({
  id,
  label,
  heading,
  intro,
  align = "center",
}: {
  id: string;
  label: string;
  heading: string;
  intro?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "relative grid gap-4",
        align === "center"
          ? "mx-auto max-w-2xl justify-items-center text-center"
          : "justify-items-start",
      )}
    >
      <span className="bg-mint rounded-full px-3.5 py-1 text-xs font-bold tracking-wider text-teal-800 uppercase dark:text-teal-200 [&:lang(km)]:tracking-normal [&:lang(km)]:normal-case">
        {label}
      </span>
      <h2
        id={`${id}-heading`}
        className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-tight [&:lang(km)]:leading-normal"
      >
        {heading}
      </h2>
      {intro && <p className="text-lg text-pretty text-slate-600 dark:text-slate-300">{intro}</p>}
    </div>
  );
}

function IconTile({
  icon: Icon,
  tone,
  size = "md",
}: {
  icon: IconComponent;
  /** Gradient and shadow colors */
  tone: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-linear-to-br text-white shadow-lg ring-1 ring-white/25 ring-inset",
        size === "md" ? "size-13 rounded-2xl" : "size-11 rounded-xl",
        tone,
      )}
    >
      <Icon className={size === "md" ? "size-6" : "size-5"} aria-hidden />
    </span>
  );
}

function PlanCard({
  badge,
  icon,
  tone,
  name,
  description,
  price,
  period,
  features,
  children,
}: {
  /** Shown above the card, which is also highlighted */
  badge?: string;
  icon: IconComponent;
  tone: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  /** The call to action */
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "landing-card relative flex h-full flex-col gap-6 rounded-3xl p-7",
        badge &&
          "from-mint/70 border-2 border-teal-500/60 bg-linear-to-b to-white/90 shadow-[0_30px_60px_-25px_rgb(13_148_136/0.45)] md:-my-5 md:py-12 dark:border-teal-400/40 dark:from-teal-400/10 dark:to-white/[0.03]",
      )}
    >
      {badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-teal-800 to-emerald-700 px-4 py-1 text-xs font-semibold whitespace-nowrap text-white shadow-md">
          {badge}
        </span>
      )}
      <IconTile icon={icon} tone={tone} size="sm" />
      <div className="grid gap-1">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      <p className="flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight">{price}</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">{period}</span>
      </p>
      <ul className="grid gap-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <Check
              className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              strokeWidth={3}
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-2">{children}</div>
    </div>
  );
}

/** A large, blurred mint circle that adds depth behind a section */
function Glow({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-mint/60 pointer-events-none absolute size-[34rem] rounded-full blur-3xl dark:bg-teal-400/10",
        className,
      )}
    />
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid content-start gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="grid gap-2.5 text-sm text-slate-600 dark:text-slate-300">{children}</ul>
    </div>
  );
}

function FooterLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  const className = "hover:text-landing-ink transition-colors";
  return (
    <li>
      {/* In-page anchors are plain links; pages go through the router */}
      {href.startsWith("#") ? (
        <a href={href} className={className} {...props} />
      ) : (
        <Link href={href} className={className} {...props} />
      )}
    </li>
  );
}

/** GitHub's mark (from Octicons, MIT license) */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
