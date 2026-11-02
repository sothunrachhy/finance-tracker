import { ChartColumn, ShieldCheck, Target, Wallet } from "lucide-react";
import Link from "next/link";
import { DemoButton } from "@/components/auth/demo-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

const FEATURES = [
  { key: "track", icon: Wallet },
  { key: "insights", icon: ChartColumn },
  { key: "budgets", icon: Target },
  { key: "privacy", icon: ShieldCheck },
] as const;

export default async function Home() {
  const { locale, t } = await getI18n();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-4">
        <Logo href={localePath(locale, "/")} compactOnMobile />
        <nav className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href={localePath(locale, "/login")}
            className={buttonVariants({ variant: "ghost" })}
          >
            {t("landing.login")}
          </Link>
          <Link href={localePath(locale, "/register")} className={buttonVariants()}>
            {t("landing.signup")}
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-16 md:py-24">
        <section className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            {t("landing.title")}
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg text-pretty">
            {t("landing.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={localePath(locale, "/register")} className={buttonVariants({ size: "lg" })}>
              {t("landing.getStarted")}
            </Link>
            <DemoButton size="lg">{t("landing.tryDemo")}</DemoButton>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ key, icon: Icon }) => (
            <div key={key} className="flex gap-4 rounded-xl border p-5">
              <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="grid gap-1">
                <h2 className="font-medium">{t(`landing.features.${key}.title`)}</h2>
                <p className="text-muted-foreground text-sm">{t(`landing.features.${key}.text`)}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
