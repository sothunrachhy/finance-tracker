import "server-only";
import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { categories, transactions } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { monthRange } from "@/lib/dates";
import { db } from "@/lib/db";
import { categoryName } from "./category-name";
import { sumByType, type TransactionRow, transactionRowColumns } from "./transactions";

function inRange(userId: string, start: string, end: string) {
  return and(
    eq(transactions.userId, userId),
    gte(transactions.date, start),
    lt(transactions.date, end),
  );
}

export async function getMonthSummary(userId: string, month: string) {
  const { start, end } = monthRange(month);
  const [summary] = await db
    .select({ income: sumByType("INCOME"), expenses: sumByType("EXPENSE"), count: count() })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(inRange(userId, start, end));
  return summary;
}

export type CategorySpending = {
  id: string;
  name: string;
  color: string;
  icon: string;
  total: number;
};

/** Expense totals per category for a month, largest first. */
export async function getSpendingByCategory(
  userId: string,
  month: string,
  locale: Locale,
): Promise<CategorySpending[]> {
  const { start, end } = monthRange(month);
  const total = sql<number>`sum(${transactions.amount})`.mapWith(Number);

  return db
    .select({
      id: categories.id,
      name: categoryName(locale),
      color: categories.color,
      icon: categories.icon,
      total,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(inRange(userId, start, end), eq(categories.type, "EXPENSE")))
    .groupBy(categories.id)
    .orderBy(desc(total));
}

export type MonthTrend = { month: string; income: number; expenses: number };

/** Income and expenses for each month in `months` (oldest first), zero-filled. */
export async function getMonthlyTrend(userId: string, months: string[]): Promise<MonthTrend[]> {
  const start = monthRange(months[0]).start;
  const end = monthRange(months[months.length - 1]).end;
  const monthKey = sql<string>`to_char(${transactions.date}, 'YYYY-MM')`;

  const rows = await db
    .select({ month: monthKey, income: sumByType("INCOME"), expenses: sumByType("EXPENSE") })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(inRange(userId, start, end))
    .groupBy(monthKey);

  const byMonth = new Map(rows.map((row) => [row.month, row]));
  return months.map((month) => ({
    month,
    income: byMonth.get(month)?.income ?? 0,
    expenses: byMonth.get(month)?.expenses ?? 0,
  }));
}

export async function getRecentTransactions(
  userId: string,
  month: string,
  locale: Locale,
  limit = 6,
): Promise<TransactionRow[]> {
  const { start, end } = monthRange(month);
  const rows = await db
    .select(transactionRowColumns(locale))
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(inRange(userId, start, end))
    .orderBy(desc(transactions.date), desc(transactions.createdAt), desc(transactions.id))
    .limit(limit);
  return rows as TransactionRow[];
}
