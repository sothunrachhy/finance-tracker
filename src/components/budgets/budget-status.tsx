import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import { type BudgetStatus, formatPercent } from "@/lib/stats";
import { cn } from "@/lib/utils";

const STATUS = {
  ok: {
    label: "On track",
    icon: CircleCheck,
    iconClass: "text-status-good",
    fill: "bg-status-good",
  },
  warning: {
    label: "Near limit",
    icon: TriangleAlert,
    iconClass: "text-status-warning",
    fill: "bg-status-warning",
  },
  over: {
    label: "Over budget",
    icon: CircleAlert,
    iconClass: "text-status-critical",
    fill: "bg-status-critical",
  },
} as const;

/** Icon + text label: the status never relies on color alone. */
export function BudgetStatusLabel({ status }: { status: BudgetStatus }) {
  const { label, icon: Icon, iconClass } = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      <Icon className={cn("size-3.5", iconClass)} aria-hidden />
      {label}
    </span>
  );
}

/** A meter of spent vs limit. Overspending fills the track and is spelled out in text. */
export function BudgetMeter({
  spent,
  limit,
  status,
  label,
}: {
  spent: number;
  limit: number;
  status: BudgetStatus;
  label: string;
}) {
  const ratio = limit > 0 ? spent / limit : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={spent}
      aria-valuetext={`${formatPercent(ratio)} of budget used`}
      className="bg-muted h-2 w-full overflow-hidden rounded-full"
    >
      <div
        className={cn("h-full rounded-full transition-all", STATUS[status].fill)}
        style={{ width: `${Math.min(ratio, 1) * 100}%` }}
      />
    </div>
  );
}
