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
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("dashboard.title") };
}

export default function DashboardPage({ searchParams }: PageProps<"/[lang]/dashboard">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/[lang]/dashboard">, "searchParams">) {
  const user = await getCurrentUser();
  const { locale, t } = await getI18n();
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
  const monthName = formatMonth(month, "long", locale);
  const previousLabel = formatMonth(previousMonth, "short", locale);
  const money = (cents: number) => formatMoney(cents, user.currency, { locale });
  const path = (p: string) => localePath(locale, p);

  const budgetAlerts = budgets
    .map((budget) => ({ ...budget, status: budgetStatus(budget.spent, budget.amount) }))
    .filter((budget) => budget.status !== "ok")
    .sort((a, b) => b.spent / b.amount - a.spent / a.amount);

  return (
    <>
      <PageHeader
        title={t("dashboard.greeting", { name: user.name.split(" ")[0] })}
        description={t("dashboard.description", { month: monthName })}
        actions={
          <>
            <MonthPicker month={month} />
            <TransactionDialog categories={categories} today={todayISO()}>
              <Plus aria-hidden />
              {t("transactions.add")}
            </TransactionDialog>
          </>
        }
      />

      <div className="grid gap-4">
        <section
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          aria-label={t("dashboard.totals")}
        >
          <StatTile
            label={t("dashboard.income")}
            icon={ArrowDownLeft}
            value={money(summary.income)}
            footnote={t("dashboard.previousMonth", {
              month: previousLabel,
              amount: money(previous.income),
            })}
          />
          <StatTile
            label={t("dashboard.expenses")}
            icon={ArrowUpRight}
            value={money(summary.expenses)}
            footnote={t("dashboard.previousMonth", {
              month: previousLabel,
              amount: money(previous.expenses),
            })}
          />
          <StatTile
            label={t("dashboard.net")}
            icon={Scale}
            value={formatMoney(net, user.currency, { signDisplay: "exceptZero", locale })}
            footnote={t("dashboard.netHint")}
          />
          <StatTile
            label={t("dashboard.savingsRate")}
            icon={PiggyBank}
            value={rate === null ? "—" : formatPercent(rate)}
            footnote={rate === null ? t("dashboard.noIncome") : t("dashboard.savingsHint")}
          />
        </section>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t("dashboard.incomeVsExpenses")}</CardTitle>
              <CardDescription>{t("dashboard.lastSixMonths")}</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={trend} currency={user.currency} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("dashboard.spendingByCategory")}</CardTitle>
              <CardDescription>
                {t("dashboard.totalAmount", { amount: money(summary.expenses) })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {spending.length > 0 ? (
                <SpendingByCategory data={spending} currency={user.currency} />
              ) : (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  {t("dashboard.noExpenses")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t("dashboard.recent")}</CardTitle>
              <CardAction>
                <Link
                  href={path(`/transactions?month=${month}`)}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  {t("dashboard.viewAll")}
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {recent.length > 0 ? (
                <RecentTransactions rows={recent} currency={user.currency} />
              ) : (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  {t("dashboard.nothingYet", { month: monthName })}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("dashboard.budgetWatch")}</CardTitle>
              <CardDescription>{t("dashboard.budgetWatchDescription")}</CardDescription>
              <CardAction>
                <Link
                  href={path(`/budgets?month=${month}`)}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  {t("dashboard.budgetsLink")}
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  {t("dashboard.noBudgets")}{" "}
                  <Link
                    href={path(`/budgets?month=${month}`)}
                    className="text-foreground underline"
                  >
                    {t("dashboard.setOne")}
                  </Link>
                </p>
              ) : budgetAlerts.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  {t("dashboard.allOnTrack", { count: budgets.length })}
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
                        label={t("budgets.meterLabel", { name: budget.categoryName })}
                      />
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {t("dashboard.spentOf", {
                          spent: money(budget.spent),
                          limit: money(budget.amount),
                        })}
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
