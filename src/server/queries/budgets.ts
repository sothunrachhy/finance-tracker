import "server-only";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { budgets, categories, transactions } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { monthRange } from "@/lib/dates";
import { db } from "@/lib/db";
import { alphabetical, categoryName } from "./category-name";

export type BudgetWithSpending = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  /** Limit in cents */
  amount: number;
  /** Spent so far this month in cents */
  spent: number;
};

export async function getBudgetsWithSpending(
  userId: string,
  month: string,
  locale: Locale,
): Promise<BudgetWithSpending[]> {
  const name = categoryName(locale);
  const { start, end } = monthRange(month);

  // Spending per category for the month, joined onto that month's budgets
  const spending = db
    .select({
      categoryId: transactions.categoryId,
      spent: sql<number>`sum(${transactions.amount})`.as("spent"),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, start),
        lt(transactions.date, end),
      ),
    )
    .groupBy(transactions.categoryId)
    .as("spending");

  return db
    .select({
      id: budgets.id,
      categoryId: categories.id,
      categoryName: name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
      amount: budgets.amount,
      spent: sql<number>`coalesce(${spending.spent}, 0)`.mapWith(Number),
    })
    .from(budgets)
    .innerJoin(categories, eq(budgets.categoryId, categories.id))
    .leftJoin(spending, eq(spending.categoryId, budgets.categoryId))
    .where(and(eq(budgets.userId, userId), eq(budgets.month, start)))
    .orderBy(...alphabetical(name));
}
