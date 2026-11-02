"use client";

import { Pencil } from "lucide-react";
import { CategoryIconBadge } from "@/components/category-icon";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { useI18n } from "@/i18n/client";
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
  const { locale, t } = useI18n();
  const money = (cents: number) => formatMoney(cents, currency, { locale });

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
                  "aria-label": t("budgets.editLabel", { name: budget.categoryName }),
                  title: t("common.edit"),
                }}
              >
                <Pencil />
              </BudgetDialog>
              <ConfirmDeleteButton
                label={t("budgets.deleteLabel", { name: budget.categoryName })}
                title={t("budgets.deleteTitle", { name: budget.categoryName })}
                description={t("budgets.deleteDescription")}
                onConfirm={() => deleteBudget(budget.id)}
              />
            </div>
            <BudgetMeter
              spent={budget.spent}
              limit={budget.amount}
              status={status}
              label={t("budgets.meterLabel", { name: budget.categoryName })}
            />
            <div className="flex justify-between text-sm tabular-nums">
              <span>
                {t("budgets.spentOf", { spent: money(budget.spent), limit: money(budget.amount) })}
              </span>
              <span className={remaining < 0 ? "font-medium" : "text-muted-foreground"}>
                {remaining >= 0
                  ? t("budgets.left", { amount: money(remaining) })
                  : t("budgets.over", { amount: money(-remaining) })}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
