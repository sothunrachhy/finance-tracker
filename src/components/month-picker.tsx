"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { currentMonth, formatMonth, shiftMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Prev / next month switcher that stores the month in the URL (?month=YYYY-MM). */
export function MonthPicker({ month, allowAll = false }: { month: string; allowAll?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const isAll = month === "all";

  function go(next: string) {
    const params = new URLSearchParams(searchParams);
    params.set("month", next);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params}`, { scroll: false }));
  }

  return (
    <div className={cn("flex items-center gap-1", pending && "opacity-60")} aria-busy={pending}>
      <Button
        variant="outline"
        size="icon"
        disabled={isAll}
        onClick={() => go(shiftMonth(month, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-36 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {isAll ? "All time" : formatMonth(month)}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={isAll}
        onClick={() => go(shiftMonth(month, 1))}
        aria-label="Next month"
      >
        <ChevronRight />
      </Button>
      {allowAll && (
        <Button variant="ghost" onClick={() => go(isAll ? currentMonth() : "all")}>
          {isAll ? "By month" : "All time"}
        </Button>
      )}
    </div>
  );
}
