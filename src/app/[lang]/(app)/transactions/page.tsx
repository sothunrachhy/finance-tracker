import { ArrowLeftRight, Download, Plus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { type TransactionFilters as Filters, parseTransactionFilters } from "@/lib/filters";
import { formatMoney } from "@/lib/money";
import { getCategories } from "@/server/queries/categories";
import { getTransactions } from "@/server/queries/transactions";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("transactions.title") };
}

export default function TransactionsPage({ searchParams }: PageProps<"/[lang]/transactions">) {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <Transactions searchParams={searchParams} />
    </Suspense>
  );
}

async function Transactions({
  searchParams,
}: Pick<PageProps<"/[lang]/transactions">, "searchParams">) {
  const user = await getCurrentUser();
  const { locale, t } = await getI18n();
  const money = (cents: number) => formatMoney(cents, user.currency, { locale });
  const params = await searchParams;
  const filters = parseTransactionFilters(params);
  const basePath = localePath(locale, "/transactions");
  // A wrong or far-off ?month= would otherwise quietly show this month instead
  if (params.month !== undefined && params.month !== filters.month) {
    redirect(withParams(basePath, params, { month: null }));
  }
  const [categories, result] = await Promise.all([
    getCategories(user.id, locale),
    getTransactions(user.id, filters, locale),
  ]);
  // Past the last page (an old link, or rows deleted since): go to the last page
  if (filters.page > result.pageCount) {
    redirect(
      withParams(basePath, params, {
        page: result.pageCount > 1 ? String(result.pageCount) : null,
      }),
    );
  }
  const today = todayISO();
  const hasFilters = filters.type !== "ALL" || filters.categoryId || filters.q;

  return (
    <>
      <PageHeader
        title={t("transactions.title")}
        description={t("transactions.summary", {
          count: result.total,
          income: money(result.income),
          expenses: money(result.expenses),
        })}
        actions={
          <>
            <a
              href={exportHref(filters)}
              className={buttonVariants({ variant: "outline" })}
              download
            >
              <Download aria-hidden />
              {t("transactions.export")}
            </a>
            <TransactionDialog categories={categories} today={today} currency={user.currency}>
              <Plus aria-hidden />
              {t("transactions.add")}
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
              basePath={basePath}
              searchParams={params}
            />
          </>
        ) : (
          <EmptyState
            icon={ArrowLeftRight}
            title={hasFilters ? t("transactions.noMatchTitle") : t("transactions.emptyTitle")}
            description={
              hasFilters ? t("transactions.noMatchDescription") : t("transactions.emptyDescription")
            }
            action={
              !hasFilters && (
                <TransactionDialog categories={categories} today={today} currency={user.currency}>
                  <Plus aria-hidden />
                  {t("transactions.add")}
                </TransactionDialog>
              )
            }
          />
        )}
      </div>
    </>
  );
}

/** `base` with the current query string, after applying `changes` (null removes a key). */
function withParams(
  base: string,
  params: Record<string, string | string[] | undefined>,
  changes: Record<string, string | null>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) query.delete(key);
    else query.set(key, value);
  }
  const search = query.toString();
  return search ? `${base}?${search}` : base;
}

/** The export link carries the same filters, so the file matches the table. */
function exportHref(filters: Filters): string {
  const params = new URLSearchParams({ month: filters.month });
  if (filters.type !== "ALL") params.set("type", filters.type.toLowerCase());
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.q) params.set("q", filters.q);
  return `/api/export?${params}`;
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
