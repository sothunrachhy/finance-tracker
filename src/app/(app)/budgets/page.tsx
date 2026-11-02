import { Plus, Target } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import { BudgetList } from "@/components/budgets/budget-list";
import { BudgetMeter } from "@/components/budgets/budget-status";
import { CopyBudgetsButton } from "@/components/budgets/copy-budgets-button";
import { CategoryIconBadge } from "@/components/category-icon";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth";
import { currentMonth, formatMonth, isValidMonth, shiftMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { budgetStatus } from "@/lib/stats";
import { getBudgetsWithSpending } from "@/server/queries/budgets";
import { getCategories } from "@/server/queries/categories";
import { getSpendingByCategory } from "@/server/queries/dashboard";

export const metadata: Metadata = { title: "Budgets" };

export default function BudgetsPage({ searchParams }: PageProps<"/budgets">) {
  return (
    <Suspense fallback={<BudgetsSkeleton />}>
      <Budgets searchParams={searchParams} />
    </Suspense>
  );
}

async function Budgets({ searchParams }: Pick<PageProps<"/budgets">, "searchParams">) {
  const user = await getCurrentUser();
  const { month: monthParam } = await searchParams;
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();
  const previousMonth = shiftMonth(month, -1);

  const [budgets, previousBudgets, categories, spending] = await Promise.all([
    getBudgetsWithSpending(user.id, month),
    getBudgetsWithSpending(user.id, previousMonth),
    getCategories(user.id),
    getSpendingByCategory(user.id, month),
  ]);

  const money = (cents: number) => formatMoney(cents, user.currency);
  const budgeted = new Set(budgets.map((b) => b.categoryId));
  const unbudgetedCategories = categories.filter(
    (c) => c.type === "EXPENSE" && !budgeted.has(c.id),
  );
  const unbudgetedSpending = spending.filter((s) => !budgeted.has(s.id));
  const totalLimit = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const canCopy = previousBudgets.some((b) => !budgeted.has(b.categoryId));
  const copyLabel = `Copy ${formatMonth(previousMonth, "short")} budgets`;

  const addButton = (
    <BudgetDialog month={month} categories={unbudgetedCategories}>
      <Plus aria-hidden />
      Add budget
    </BudgetDialog>
  );

  return (
    <>
      <PageHeader
        title="Budgets"
        description={`Monthly spending limits for ${formatMonth(month)}.`}
        actions={
          <>
            <MonthPicker month={month} />
            {unbudgetedCategories.length > 0 && addButton}
          </>
        }
      />

      {budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title={`No budgets for ${formatMonth(month)}`}
          description="Set a monthly limit on a category and we'll warn you at 80%."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {addButton}
              {canCopy && <CopyBudgetsButton month={month} label={copyLabel} />}
            </div>
          }
        />
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
              <CardDescription>Across {budgets.length} budgeted categories</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <BudgetMeter
                spent={totalSpent}
                limit={totalLimit}
                status={budgetStatus(totalSpent, totalLimit)}
                label="Total budget"
              />
              <div className="flex flex-wrap justify-between gap-2 text-sm tabular-nums">
                <span>
                  {money(totalSpent)}{" "}
                  <span className="text-muted-foreground">spent of {money(totalLimit)}</span>
                </span>
                <span className="text-muted-foreground">
                  {totalLimit >= totalSpent
                    ? `${money(totalLimit - totalSpent)} left`
                    : `${money(totalSpent - totalLimit)} over`}
                </span>
              </div>
              {canCopy && (
                <div>
                  <CopyBudgetsButton month={month} label={copyLabel} />
                </div>
              )}
            </CardContent>
          </Card>

          <BudgetList budgets={budgets} month={month} currency={user.currency} />
        </div>
      )}

      {unbudgetedSpending.length > 0 && (
        <section className="mt-8 grid gap-3" aria-labelledby="unbudgeted-heading">
          <div>
            <h2 id="unbudgeted-heading" className="font-medium">
              Spending without a budget
            </h2>
            <p className="text-muted-foreground text-sm">
              Categories you spent on this month that have no limit yet.
            </p>
          </div>
          <ul className="divide-y rounded-xl border">
            {unbudgetedSpending.map((row) => (
              <li key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                <CategoryIconBadge icon={row.icon} color={row.color} />
                <span className="flex-1 truncate font-medium">{row.name}</span>
                <span className="text-sm tabular-nums">{money(row.total)}</span>
                <BudgetDialog
                  month={month}
                  categories={[]}
                  category={{ id: row.id, name: row.name }}
                  triggerProps={{ variant: "outline", size: "sm" }}
                >
                  Set budget
                </BudgetDialog>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function BudgetsSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-36" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
