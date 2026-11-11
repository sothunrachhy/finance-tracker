"use client";

import { ArrowLeftRight, LayoutDashboard, Settings, Tags, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/transactions", key: "transactions", icon: ArrowLeftRight },
  { href: "/categories", key: "categories", icon: Tags },
  { href: "/budgets", key: "budgets", icon: Target },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t, path } = useI18n();

  return (
    <nav className="grid gap-1.5" aria-label={t("nav.main")}>
      {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
        const localized = path(href);
        const active = pathname === localized || pathname.startsWith(`${localized}/`);
        return (
          <Link
            key={href}
            href={localized}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white",
              active &&
                "bg-mint hover:bg-mint dark:hover:bg-mint font-semibold text-teal-800 shadow-sm hover:text-teal-800 dark:text-teal-200 dark:hover:text-teal-200",
            )}
          >
            <Icon
              className={cn("size-5", active && "text-teal-700 dark:text-teal-300")}
              aria-hidden
            />
            {t(`nav.${key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
