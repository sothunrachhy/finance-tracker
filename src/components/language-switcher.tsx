"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { CambodiaFlag, UnitedKingdomFlag } from "@/components/flags";
import { type Locale, LOCALE_NAMES, localePath, LOCALES, splitLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

const FLAGS: Record<Locale, typeof CambodiaFlag> = { en: UnitedKingdomFlag, km: CambodiaFlag };

/** Flag buttons: 🇬🇧 English, 🇰🇭 Khmer. Keeps the current page, filters and all. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function switchTo(target: Locale) {
    if (target === locale) return;
    const { path } = splitLocale(pathname);
    // Read the query string at click time; useSearchParams would force a Suspense boundary
    const href = localePath(target, path) + window.location.search;
    startTransition(() => router.push(href, { scroll: false }));
  }

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn("flex items-center gap-1", pending && "opacity-60", className)}
    >
      {LOCALES.map((option) => {
        const Flag = FLAGS[option];
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            onClick={() => switchTo(option)}
            aria-pressed={active}
            aria-label={LOCALE_NAMES[option]}
            title={
              active
                ? LOCALE_NAMES[option]
                : t("language.switchTo", { language: LOCALE_NAMES[option] })
            }
            className={cn(
              "focus-visible:ring-ring flex rounded-md p-1 transition outline-none focus-visible:ring-2",
              active
                ? "bg-muted"
                : "opacity-50 grayscale-[40%] hover:opacity-100 hover:grayscale-0",
            )}
          >
            <Flag className="h-4 w-6 rounded-[2px] shadow-[0_0_0_1px_rgb(0_0_0/0.1)]" />
          </button>
        );
      })}
    </div>
  );
}
