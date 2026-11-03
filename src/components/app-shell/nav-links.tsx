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
    <nav className="grid gap-1" aria-label={t("nav.main")}>
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
              "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {t(`nav.${key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
