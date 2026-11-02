import { ArrowLeftRight, Download, Plus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { parseTransactionFilters } from "@/lib/filters";
import { formatMoney } from "@/lib/money";
import { getCategories } from "@/server/queries/categories";
import { getTransactions } from "@/server/queries/transactions";

export const metadata: Metadata = { title: "Transactions" };

export default function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <Transactions searchParams={searchParams} />
    </Suspense>
  );
}

async function Transactions({ searchParams }: Pick<PageProps<"/transactions">, "searchParams">) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const filters = parseTransactionFilters(params);
  const [categories, result] = await Promise.all([
    getCategories(user.id),
    getTransactions(user.id, filters),
  ]);
  const today = todayISO();
  const hasFilters = filters.type !== "ALL" || filters.categoryId || filters.q;

  return (
    <>
      <PageHeader
        title="Transactions"
        description={
          <>
            {result.total} {result.total === 1 ? "transaction" : "transactions"} · Income{" "}
            {formatMoney(result.income, user.currency)} · Expenses{" "}
            {formatMoney(result.expenses, user.currency)}
          </>
        }
        actions={
          <>
            <a
              href={filters.month === "all" ? "/api/export" : `/api/export?month=${filters.month}`}
              className={buttonVariants({ variant: "outline" })}
              download
            >
              <Download aria-hidden />
              Export CSV
            </a>
            <TransactionDialog categories={categories} today={today}>
              <Plus aria-hidden />
              Add transaction
            </TransactionDialog>
          </>
        }
      />

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TransactionFilters filters={filters} categories={categories} />
          <MonthPicker month={filters.month} allowAll />
        </div>

        {result.rows.length > 0 ? (
          <>
            <TransactionsTable
              rows={result.rows}
              currency={user.currency}
              categories={categories}
              today={today}
            />
            <Pagination
              page={filters.page}
              pageCount={result.pageCount}
              basePath="/transactions"
              searchParams={params}
            />
          </>
        ) : (
          <EmptyState
            icon={ArrowLeftRight}
            title={hasFilters ? "No matching transactions" : "No transactions yet"}
            description={
              hasFilters
                ? "Try a different search or clear the filters."
                : "Add your first income or expense for this period."
            }
            action={
              !hasFilters && (
                <TransactionDialog categories={categories} today={today}>
                  <Plus aria-hidden />
                  Add transaction
                </TransactionDialog>
              )
            }
          />
        )}
      </div>
    </>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="flex justify-between">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-8 w-36" />
      </div>
      <Skeleton className="h-8 w-full max-w-xl" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
