import { CategoryIconBadge } from "@/components/category-icon";
import { getI18n } from "@/i18n/server";
import { categoryColorVar } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import { formatPercent } from "@/lib/stats";
import type { CategorySpending } from "@/server/queries/dashboard";

const MAX_ROWS = 7;

/**
 * Ranked horizontal bars, largest first, each in its category's color. Bars on a
 * shared baseline compare far more precisely than pie slices, and every row prints
 * its name, amount and share, so nothing depends on color alone.
 */
export async function SpendingByCategory({
  data,
  currency,
}: {
  data: CategorySpending[];
  currency: string;
}) {
  const { locale, t } = await getI18n();
  const total = data.reduce((sum, row) => sum + row.total, 0);

  // Fold the long tail into one row so the chart stays readable
  const rows =
    data.length > MAX_ROWS
      ? [
          ...data.slice(0, MAX_ROWS - 1),
          {
            id: "other",
            name: t("dashboard.moreCategories", { count: data.length - MAX_ROWS + 1 }),
            color: "",
            icon: "tag",
            total: data.slice(MAX_ROWS - 1).reduce((sum, row) => sum + row.total, 0),
          },
        ]
      : data;
  const max = Math.max(...rows.map((row) => row.total));

  return (
    <ul className="grid gap-3.5">
      {rows.map((row) => (
        <li key={row.id} className="grid gap-1.5">
          <div className="flex items-center gap-3 text-sm">
            <CategoryIconBadge icon={row.icon} color={row.color} className="size-9 rounded-xl" />
            <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
            <span className="font-semibold tabular-nums">
              {formatMoney(row.total, currency, { locale })}
            </span>
            <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
              {formatPercent(row.total / total)}
            </span>
          </div>
          <div className="bg-muted ml-12 h-1.5 overflow-hidden rounded-full" aria-hidden>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((row.total / max) * 100, 1)}%`,
                backgroundColor: categoryColorVar(row.color),
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
