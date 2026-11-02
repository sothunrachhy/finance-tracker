import { CategoryIconBadge } from "@/components/category-icon";
import { getI18n } from "@/i18n/server";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
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
    <ul className="divide-y">
      {rows.map((row) => {
        const isIncome = row.categoryType === "INCOME";
        return (
          <li key={row.id} className="flex items-center gap-3 py-2.5">
            <CategoryIconBadge icon={row.categoryIcon} color={row.categoryColor} />
            <div className="grid min-w-0 flex-1">
              <span className="truncate text-sm font-medium">{row.note ?? row.categoryName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {row.categoryName} · {formatDate(row.date, locale)}
              </span>
            </div>
            <span className={cn("text-sm font-medium tabular-nums", isIncome && "text-success")}>
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
