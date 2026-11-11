"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { currentMonth, formatMonth, shiftMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Prev / next month switcher that stores the month in the URL (?month=YYYY-MM). */
export function MonthPicker({ month, allowAll = false }: { month: string; allowAll?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();
  const isAll = month === "all";

  function go(next: string) {
    const params = new URLSearchParams(searchParams);
    params.set("month", next);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/5",
        pending && "opacity-60",
      )}
      aria-busy={pending}
    >
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        disabled={isAll}
        onClick={() => go(shiftMonth(month, -1))}
        aria-label={t("monthPicker.previous")}
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-32 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {isAll ? t("monthPicker.allTime") : formatMonth(month, "long", locale)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        disabled={isAll}
        onClick={() => go(shiftMonth(month, 1))}
        aria-label={t("monthPicker.next")}
      >
        <ChevronRight />
      </Button>
      {allowAll && (
        <Button
          variant="ghost"
          className="rounded-full"
          onClick={() => go(isAll ? currentMonth() : "all")}
        >
          {isAll ? t("monthPicker.byMonth") : t("monthPicker.allTime")}
        </Button>
      )}
    </div>
  );
}
