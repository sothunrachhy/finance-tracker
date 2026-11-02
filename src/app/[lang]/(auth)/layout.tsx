import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getI18n();

  return (
    <div className="bg-muted/40 relative flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Logo href={localePath(locale, "/")} />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
