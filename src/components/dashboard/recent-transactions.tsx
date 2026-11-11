import { CategoryIconBadge } from "@/components/category-icon";
import { FlowIcon } from "@/components/flow-icon";
import { getI18n } from "@/i18n/server";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { TransactionRow } from "@/server/queries/transactions";

export async function RecentTransactions({
  rows,
  currency,
}: {
  rows: TransactionRow[];
  currency: string;
}) {
  const { locale } = await getI18n();

  return (
    <ul className="divide-y divide-slate-200/70 dark:divide-white/10">
      {rows.map((row) => {
        const isIncome = row.categoryType === "INCOME";
        return (
          <li key={row.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <CategoryIconBadge
              icon={row.categoryIcon}
              color={row.categoryColor}
              className="size-10 rounded-xl"
            />
            <div className="grid min-w-0 flex-1">
              <span className="truncate text-sm font-semibold">{row.note ?? row.categoryName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {row.categoryName} · {formatDate(row.date, locale)}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums">
              <FlowIcon type={row.categoryType} />
              {formatMoney(isIncome ? row.amount : -row.amount, currency, {
                signDisplay: "always",
                locale,
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
