import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Money in / money out marker, in the same colors as the dashboard chart (blue
 * income, orange expenses) so the app uses one color code everywhere. Green and
 * red stay reserved for good/bad states. Always paired with a +/− sign or label,
 * so it never carries meaning by color alone.
 */
export function FlowIcon({ type, className }: { type: "INCOME" | "EXPENSE"; className?: string }) {
  const Icon = type === "INCOME" ? ArrowDownLeft : ArrowUpRight;
  return (
    <Icon
      className={cn(
        "size-3.5 shrink-0",
        type === "INCOME" ? "text-series-1" : "text-series-2",
        className,
      )}
      aria-hidden
    />
  );
}
