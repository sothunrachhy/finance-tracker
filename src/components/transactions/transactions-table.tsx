import { CategoryIconBadge } from "@/components/category-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { CategoryOption } from "@/server/queries/categories";
import type { TransactionRow } from "@/server/queries/transactions";
import { TransactionRowActions } from "./transaction-row-actions";

export function TransactionsTable({
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
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Note</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDate(row.date)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <CategoryIconBadge icon={row.categoryIcon} color={row.categoryColor} />
                  <div className="grid min-w-0">
                    <span className="truncate font-medium">{row.categoryName}</span>
                    {row.note && (
                      <span className="text-muted-foreground truncate text-xs md:hidden">
                        {row.note}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground hidden max-w-xs truncate md:table-cell">
                {row.note ?? "—"}
              </TableCell>
              <TableCell
                className={
                  row.categoryType === "INCOME"
                    ? "text-success text-right font-medium tabular-nums"
                    : "text-right font-medium tabular-nums"
                }
              >
                {formatMoney(row.categoryType === "INCOME" ? row.amount : -row.amount, currency, {
                  signDisplay: "always",
                })}
              </TableCell>
              <TableCell>
                <TransactionRowActions transaction={row} categories={categories} today={today} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
