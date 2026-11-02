"use client";

import { Pencil } from "lucide-react";
import { CategoryIconBadge } from "@/components/category-icon";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { formatMoney } from "@/lib/money";
import { budgetStatus } from "@/lib/stats";
import { deleteBudget } from "@/server/actions/budgets";
import type { BudgetWithSpending } from "@/server/queries/budgets";
import { BudgetDialog } from "./budget-dialog";
import { BudgetMeter, BudgetStatusLabel } from "./budget-status";

export function BudgetList({
  budgets,
  month,
  currency,
}: {
  budgets: BudgetWithSpending[];
  month: string;
  currency: string;
}) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {budgets.map((budget) => {
        const status = budgetStatus(budget.spent, budget.amount);
        const remaining = budget.amount - budget.spent;
        const category = { id: budget.categoryId, name: budget.categoryName };

        return (
          <li key={budget.id} className="grid gap-3 rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <CategoryIconBadge icon={budget.categoryIcon} color={budget.categoryColor} />
              <div className="grid min-w-0 flex-1">
                <span className="truncate font-medium">{budget.categoryName}</span>
                <BudgetStatusLabel status={status} />
              </div>
              <BudgetDialog
                month={month}
                categories={[]}
                category={category}
                amount={budget.amount}
                triggerProps={{
                  variant: "ghost",
                  size: "icon-sm",
                  "aria-label": `Edit ${budget.categoryName} budget`,
                  title: "Edit",
                }}
              >
                <Pencil />
              </BudgetDialog>
              <ConfirmDeleteButton
                label={`Delete ${budget.categoryName} budget`}
                title={`Remove the ${budget.categoryName} budget?`}
                description="Your transactions stay; only the spending limit is removed."
                onConfirm={() => deleteBudget(budget.id)}
              />
            </div>
            <BudgetMeter
              spent={budget.spent}
              limit={budget.amount}
              status={status}
              label={`${budget.categoryName} budget`}
            />
            <div className="flex justify-between text-sm tabular-nums">
              <span>
                {formatMoney(budget.spent, currency)}{" "}
                <span className="text-muted-foreground">
                  of {formatMoney(budget.amount, currency)}
                </span>
              </span>
              <span className={remaining < 0 ? "font-medium" : "text-muted-foreground"}>
                {remaining >= 0
                  ? `${formatMoney(remaining, currency)} left`
                  : `${formatMoney(-remaining, currency)} over`}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
