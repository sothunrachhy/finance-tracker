import { CategoryIconBadge } from "@/components/category-icon";
import { FlowIcon } from "@/components/flow-icon";
import { RemovableRow } from "@/components/removable-row";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getI18n } from "@/i18n/server";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { CategoryOption } from "@/server/queries/categories";
import type { TransactionRow } from "@/server/queries/transactions";
import { TransactionRowActions } from "./transaction-row-actions";

export async function TransactionsTable({
  rows,
  currency,
  categories,
  today,
}: {
  rows: TransactionRow[];
  currency: string;
  categories: CategoryOption[];
  today: string;
}) {
  const { locale, t } = await getI18n();

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-32 sm:table-cell">
              {t("transactions.columns.date")}
            </TableHead>
            <TableHead>{t("transactions.columns.category")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("transactions.columns.note")}</TableHead>
            <TableHead className="text-right">{t("transactions.columns.amount")}</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">{t("transactions.columns.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <RemovableRow key={row.id}>
              <TableCell className="text-muted-foreground hidden tabular-nums sm:table-cell">
                {formatDate(row.date, locale)}
              </TableCell>
              {/* whitespace-normal: cells don't wrap by default, which cut notes off on phones */}
              <TableCell className="whitespace-normal md:whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <CategoryIconBadge icon={row.categoryIcon} color={row.categoryColor} />
                  <div className="grid min-w-0">
                    <span className="truncate font-medium">{row.categoryName}</span>
                    {/* On small screens the date and note columns are hidden, so show them here */}
                    {row.note && (
                      <span className="text-muted-foreground line-clamp-2 text-xs break-words md:hidden">
                        {row.note}
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs sm:hidden">
                      {formatDate(row.date, locale)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground hidden max-w-xs truncate md:table-cell">
                {row.note ?? "—"}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                <span className="inline-flex items-center gap-1.5">
                  {/* The sign says it already; phones skip the arrow to leave the note room */}
                  <FlowIcon type={row.categoryType} className="hidden sm:block" />
                  {formatMoney(row.categoryType === "INCOME" ? row.amount : -row.amount, currency, {
                    signDisplay: "always",
                    locale,
                  })}
                </span>
              </TableCell>
              <TableCell>
                <TransactionRowActions
                  transaction={row}
                  categories={categories}
                  today={today}
                  currency={currency}
                />
              </TableCell>
            </RemovableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
