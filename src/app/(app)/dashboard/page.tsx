import { ArrowDownLeft, ArrowUpRight, PiggyBank, Plus, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BudgetMeter, BudgetStatusLabel } from "@/components/budgets/budget-status";
import { CategoryIconBadge } from "@/components/category-icon";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SpendingByCategory } from "@/components/dashboard/spending-by-category";
import { StatTile } from "@/components/dashboard/stat-tile";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth";
import {
  currentMonth,
  formatMonth,
  isValidMonth,
  recentMonths,
  shiftMonth,
  todayISO,
} from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { budgetStatus, formatPercent, savingsRate } from "@/lib/stats";
import { getBudgetsWithSpending } from "@/server/queries/budgets";
import { getCategories } from "@/server/queries/categories";
import {
  getMonthlyTrend,
  getMonthSummary,
  getRecentTransactions,
  getSpendingByCategory,
} from "@/server/queries/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/dashboard">, "searchParams">) {
  const user = await getCurrentUser();
  const { month: monthParam } = await searchParams;
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();
  const previousMonth = shiftMonth(month, -1);

  const [summary, previous, spending, trend, recent, budgets, categories] = await Promise.all([
    getMonthSummary(user.id, month),
    getMonthSummary(user.id, previousMonth),
    getSpendingByCategory(user.id, month),
    getMonthlyTrend(user.id, recentMonths(month, 6)),
    getRecentTransactions(user.id, month),
    getBudgetsWithSpending(user.id, month),
    getCategories(user.id),
  ]);

  const net = summary.income - summary.expenses;
  const rate = savingsRate(summary.income, summary.expenses);
  const previousLabel = formatMonth(previousMonth, "short");
  const money = (cents: number) => formatMoney(cents, user.currency);

  const budgetAlerts = budgets
    .map((budget) => ({ ...budget, status: budgetStatus(budget.spent, budget.amount) }))
    .filter((budget) => budget.status !== "ok")
    .sort((a, b) => b.spent / b.amount - a.spent / a.amount);

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(" ")[0]}`}
        description={`Here's your money in ${formatMonth(month)}.`}
        actions={
          <>
            <MonthPicker month={month} />
            <TransactionDialog categories={categories} today={todayISO()}>
              <Plus aria-hidden />
              Add transaction
            </TransactionDialog>
          </>
        }
      />

      <div className="grid gap-4">
        <section
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          aria-label="Monthly totals"
        >
          <StatTile
            label="Income"
            icon={ArrowDownLeft}
            value={money(summary.income)}
            footnote={`${previousLabel}: ${money(previous.income)}`}
          />
          <StatTile
            label="Expenses"
            icon={ArrowUpRight}
            value={money(summary.expenses)}
            footnote={`${previousLabel}: ${money(previous.expenses)}`}
          />
          <StatTile
            label="Net"
            icon={Scale}
            value={formatMoney(net, user.currency, { signDisplay: "exceptZero" })}
            footnote="Income minus expenses"
          />
          <StatTile
            label="Savings rate"
            icon={PiggyBank}
            value={rate === null ? "—" : formatPercent(rate)}
            footnote={rate === null ? "No income recorded yet" : "Share of income kept"}
          />
        </section>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Income vs expenses</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={trend} currency={user.currency} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Spending by category</CardTitle>
              <CardDescription>{money(summary.expenses)} total</CardDescription>
            </CardHeader>
            <CardContent>
              {spending.length > 0 ? (
                <SpendingByCategory data={spending} currency={user.currency} />
              ) : (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  No expenses recorded this month.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent transactions</CardTitle>
              <CardAction>
                <Link
                  href={`/transactions?month=${month}`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  View all
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {recent.length > 0 ? (
                <RecentTransactions rows={recent} currency={user.currency} />
              ) : (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  Nothing recorded in {formatMonth(month)} yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Budget watch</CardTitle>
              <CardDescription>Categories at 80% of their limit or more</CardDescription>
              <CardAction>
                <Link
                  href={`/budgets?month=${month}`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Budgets
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  No budgets for this month.{" "}
                  <Link href={`/budgets?month=${month}`} className="text-foreground underline">
                    Set one
                  </Link>
                </p>
              ) : budgetAlerts.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  All {budgets.length} budgets are on track.
                </p>
              ) : (
                <ul className="grid gap-4">
                  {budgetAlerts.map((budget) => (
                    <li key={budget.id} className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryIconBadge
                          icon={budget.categoryIcon}
                          color={budget.categoryColor}
                          className="size-6 rounded-md"
                        />
                        <span className="flex-1 truncate text-sm font-medium">
                          {budget.categoryName}
                        </span>
                        <BudgetStatusLabel status={budget.status} />
                      </div>
                      <BudgetMeter
                        spent={budget.spent}
                        limit={budget.amount}
                        status={budget.status}
                        label={`${budget.categoryName} budget`}
                      />
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {money(budget.spent)} of {money(budget.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-12 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  );
}
