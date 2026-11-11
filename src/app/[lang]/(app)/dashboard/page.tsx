import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { BudgetMeter, BudgetStatusLabel } from "@/components/budgets/budget-status";
import { CategoryIconBadge } from "@/components/category-icon";
import { ChartLegendKey, IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { ProgressRing, Sparkline } from "@/components/dashboard/mini-charts";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SpendingByCategory } from "@/components/dashboard/spending-by-category";
import { type Change, StatTile } from "@/components/dashboard/stat-tile";
import {
  BankCardIcon,
  ChartBarIcon,
  ChartPieIcon,
  HistoryIcon,
  type IconComponent,
  PiggyBankIcon,
  TargetIcon,
  TrendingUpIcon,
  WalletIcon,
} from "@/components/icons/mingcute";
import { MonthPicker } from "@/components/month-picker";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import type { Translator } from "@/i18n/translator";
import { getCurrentUser } from "@/lib/auth";
import {
  currentMonth,
  formatMonth,
  isMonthInRange,
  recentMonths,
  shiftMonth,
  todayISO,
} from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { budgetStatus, formatPercent, savingsRate } from "@/lib/stats";
import { cn } from "@/lib/utils";
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
  // A wrong or far-off ?month= would otherwise quietly show this month instead
  if (monthParam !== undefined && !isMonthInRange(monthParam)) {
    redirect(localePath(locale, "/dashboard"));
  }
  const month = monthParam ?? currentMonth();
  const previousMonth = shiftMonth(month, -1);

  const [summary, previous, spending, trend, recent, budgets, categories] = await Promise.all([
    getMonthSummary(user.id, month),
    getMonthSummary(user.id, previousMonth),
    getSpendingByCategory(user.id, month, locale),
    getMonthlyTrend(user.id, recentMonths(month, 6)),
    getRecentTransactions(user.id, month, locale),
    getBudgetsWithSpending(user.id, month, locale),
    getCategories(user.id, locale),
  ]);

  const net = summary.income - summary.expenses;
  const previousNet = previous.income - previous.expenses;
  const rate = savingsRate(summary.income, summary.expenses);
  const previousRate = savingsRate(previous.income, previous.expenses);
  const toneOf = (value: number | null) =>
    value === null || value === 0 ? "neutral" : value > 0 ? "positive" : "negative";
  const monthName = formatMonth(month, "long", locale);
  const previousLabel = formatMonth(previousMonth, "short", locale);
  const money = (cents: number) => formatMoney(cents, user.currency, { locale });
  const path = (p: string) => localePath(locale, p);

  // "+12% vs Oct": relative change, or null when last month gives nothing to compare with
  const change = (current: number, before: number, upIsGood: boolean): Change | undefined => {
    if (before === 0) return undefined;
    const ratio = (current - before) / Math.abs(before);
    return describeChange(t, ratio, formatPercent(Math.abs(ratio)), previousLabel, upIsGood);
  };
  // The savings rate is already a percentage, so it moves in percentage points
  const rateChange =
    rate !== null && previousRate !== null
      ? describeChange(
          t,
          rate - previousRate,
          t("dashboard.points", { value: Math.round(Math.abs(rate - previousRate) * 100) }),
          previousLabel,
          true,
        )
      : undefined;

  const budgetAlerts = budgets
    .map((budget) => ({ ...budget, status: budgetStatus(budget.spent, budget.amount) }))
    .filter((budget) => budget.status !== "ok")
    .sort((a, b) => b.spent / b.amount - a.spent / a.amount);

  const viewAll = (href: string, label: string) => (
    <Link
      href={path(href)}
      className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200/80 bg-white px-3 text-xs font-medium shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      {label}
      <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("dashboard.greeting", { name: user.name.split(" ")[0] })} <span aria-hidden>👋</span>
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.description", { month: monthName })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthPicker month={month} />
          <TransactionDialog
            categories={categories}
            today={todayISO()}
            currency={user.currency}
            triggerProps={{
              className:
                "h-10 rounded-full bg-linear-to-r from-teal-800 to-emerald-700 px-4 font-semibold text-white shadow-md shadow-emerald-800/20 hover:brightness-110 dark:text-white",
            }}
          >
            <Plus aria-hidden />
            {t("transactions.add")}
          </TransactionDialog>
        </div>
      </div>

      <div className="grid gap-5">
        <section
          className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
          aria-label={t("dashboard.totals")}
        >
          <StatTile
            label={t("dashboard.income")}
            icon={WalletIcon}
            accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
            value={money(summary.income)}
            change={change(summary.income, previous.income, true)}
            footnote={t("dashboard.previousMonth", {
              month: previousLabel,
              amount: money(previous.income),
            })}
            chart={
              <Sparkline id="spark-income" values={trend.map((m) => m.income)} color="#10b981" />
            }
          />
          <StatTile
            label={t("dashboard.expenses")}
            icon={BankCardIcon}
            accent="bg-rose-100 text-rose-500 dark:bg-rose-400/15 dark:text-rose-300"
            value={money(summary.expenses)}
            change={change(summary.expenses, previous.expenses, false)}
            footnote={t("dashboard.previousMonth", {
              month: previousLabel,
              amount: money(previous.expenses),
            })}
            chart={
              <Sparkline
                id="spark-expenses"
                values={trend.map((m) => m.expenses)}
                color="#f43f5e"
              />
            }
          />
          <StatTile
            label={t("dashboard.net")}
            icon={TrendingUpIcon}
            accent="bg-teal-100 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300"
            tone={toneOf(net)}
            value={formatMoney(net, user.currency, { signDisplay: "exceptZero", locale })}
            change={change(net, previousNet, true)}
            footnote={t("dashboard.netHint")}
            chart={
              <Sparkline
                id="spark-net"
                values={trend.map((m) => m.income - m.expenses)}
                color="#14b8a6"
              />
            }
          />
          <StatTile
            label={t("dashboard.savingsRate")}
            icon={PiggyBankIcon}
            accent="bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300"
            tone={toneOf(rate)}
            value={rate === null ? "—" : formatPercent(rate)}
            change={rateChange}
            footnote={rate === null ? t("dashboard.noIncome") : t("dashboard.savingsHint")}
            aside={
              rate !== null && <ProgressRing value={rate} className="hidden size-11 sm:block" />
            }
          />
        </section>

        {/* items-start: each card is as tall as its content, so a short category list
            doesn't leave a big empty card next to the chart */}
        <div className="grid items-start gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeading
              icon={ChartBarIcon}
              tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
              title={t("dashboard.incomeVsExpenses")}
              description={t("dashboard.lastSixMonths")}
              action={<ChartLegendKey />}
            />
            <CardContent>
              <IncomeExpenseChart data={trend} currency={user.currency} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeading
              icon={ChartPieIcon}
              tone="bg-teal-100 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300"
              title={t("dashboard.spendingByCategory")}
              description={t("dashboard.totalAmount", { amount: money(summary.expenses) })}
            />
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

        <div className="grid items-start gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeading
              icon={HistoryIcon}
              tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
              title={t("dashboard.recent")}
              action={viewAll(`/transactions?month=${month}`, t("dashboard.viewAll"))}
            />
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

          <Card className="from-mint/50 to-card bg-linear-to-b lg:col-span-2 dark:from-teal-400/10">
            <CardHeading
              icon={TargetIcon}
              tone="bg-white text-teal-600 shadow-sm dark:bg-white/10 dark:text-teal-300"
              title={t("dashboard.budgetWatch")}
              description={t("dashboard.budgetWatchDescription")}
              action={viewAll(`/budgets?month=${month}`, t("dashboard.budgetsLink"))}
            />
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
                <ul className="grid gap-3">
                  {budgetAlerts.map((budget) => (
                    <li
                      key={budget.id}
                      className="grid gap-2.5 rounded-2xl border border-white bg-white/80 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIconBadge
                          icon={budget.categoryIcon}
                          color={budget.categoryColor}
                          className="size-9 rounded-xl"
                        />
                        <span className="flex-1 truncate text-sm font-semibold">
                          {budget.categoryName}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1",
                            budget.status === "over"
                              ? "bg-rose-50 dark:bg-rose-500/10"
                              : "bg-amber-50 dark:bg-amber-500/10",
                          )}
                        >
                          <BudgetStatusLabel status={budget.status} />
                        </span>
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

/** Turns a change into words: "+12% vs Oct", with the arrow direction and whether it's good news */
function describeChange(
  t: Translator,
  delta: number,
  amount: string,
  month: string,
  upIsGood: boolean,
): Change {
  // Below half a percent rounds to 0: call it flat rather than show "+0%"
  const direction = Math.abs(delta) < 0.005 ? "flat" : delta > 0 ? "up" : "down";
  const label = direction === "flat" ? amount : `${direction === "up" ? "+" : "−"}${amount}`;
  return {
    label,
    text: t("dashboard.vsMonth", { change: label, month }),
    direction,
    good: direction === "up" ? upIsGood : !upIsGood,
  };
}

/** A card title with a tinted icon tile, an optional subtitle and an action on the right */
function CardHeading({
  icon: Icon,
  tone,
  title,
  description,
  action,
}: {
  icon: IconComponent;
  tone: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone)}>
          <Icon className="size-5" />
        </span>
        <div className="grid min-w-0 gap-0.5">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      </div>
      {action && <CardAction className="self-center">{action}</CardAction>}
    </CardHeader>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5">
      <Skeleton className="h-14 w-72" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}
