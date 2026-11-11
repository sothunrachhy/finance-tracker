import { Suspense } from "react";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { NavLinks } from "@/components/app-shell/nav-links";
import { ReportLink, ReportLinkFallback } from "@/components/app-shell/report-link";
import { SearchBox } from "@/components/app-shell/search-box";
import { UserMenu } from "@/components/app-shell/user-menu";
import { FileDownloadIcon } from "@/components/icons/mingcute";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";

// The shell (sidebar, header) is static and prerenders instantly. Only the parts
// that read the session stream in behind <Suspense>.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getI18n();

  return (
    <div className="bg-landing relative flex min-h-svh">
      {/* Soft mint and sky glows behind the whole app */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(40rem_28rem_at_70%_-5%,var(--mint),transparent),radial-gradient(32rem_24rem_at_-5%_100%,var(--sky-tint),transparent)] opacity-80 dark:opacity-40"
      />

      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-8 border-r border-white/80 bg-white/55 px-4 py-6 backdrop-blur-xl md:flex dark:border-white/5 dark:bg-white/[0.02]">
        <Logo href={localePath(locale, "/dashboard")} className="px-2 text-lg" />
        <NavLinks />
        <div className="mt-auto grid gap-4">
          <div className="from-mint/80 grid gap-3 rounded-2xl border border-white bg-linear-to-br to-white/90 p-4 shadow-sm dark:border-white/10 dark:from-teal-400/10 dark:to-white/[0.03]">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm dark:bg-white/10 dark:text-teal-300">
              <FileDownloadIcon className="size-5" />
            </span>
            <div className="grid gap-1">
              <p className="text-sm font-semibold">{t("nav.exportTitle")}</p>
              <p className="text-muted-foreground text-xs">{t("nav.exportText")}</p>
            </div>
            {/* Reads ?month= from the URL, so it streams in after the static shell */}
            <Suspense fallback={<ReportLinkFallback />}>
              <ReportLink />
            </Suspense>
          </div>
          <Suspense fallback={<Skeleton className="h-15 rounded-2xl" />}>
            <CurrentUserMenu variant="card" />
          </Suspense>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="bg-landing/70 sticky top-0 z-10 flex h-16 items-center gap-2 px-4 backdrop-blur-xl sm:gap-3 md:px-8">
          <MobileNav />
          <SearchBox className="min-w-0 flex-1 md:max-w-sm" />
          <div className="flex-1 max-md:hidden" />
          <LanguageSwitcher showName className="rounded-full" />
          <ThemeToggle />
          {/* On wide screens the account menu lives at the bottom of the sidebar */}
          <div className="md:hidden">
            <Suspense fallback={<Skeleton className="size-9 rounded-full" />}>
              <CurrentUserMenu variant="avatar" />
            </Suspense>
          </div>
        </header>
        <main className="flex-1 px-4 pt-4 pb-10 md:px-8">{children}</main>
      </div>
    </div>
  );
}

async function CurrentUserMenu({ variant }: { variant: "avatar" | "card" }) {
  const user = await getCurrentUser();
  return <UserMenu name={user.name} email={user.email} variant={variant} />;
}
