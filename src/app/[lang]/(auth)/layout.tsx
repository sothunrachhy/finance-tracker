import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getI18n();

  // Same backdrop as the landing page, so signing up feels like one flow
  return (
    <div className="marketing-backdrop relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Logo href={localePath(locale, "/")} className="relative" />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
