import "server-only";
import { and, count, desc, eq, gte, ilike, lt, or, sql, type SQL } from "drizzle-orm";
import { categories, transactions } from "@/db/schema";
import { monthRange } from "@/lib/dates";
import { db } from "@/lib/db";
import { escapeLike, PAGE_SIZE, type TransactionFilters } from "@/lib/filters";

export type TransactionRow = {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  categoryId: string;
  categoryName: string;
  categoryType: "INCOME" | "EXPENSE";
  categoryColor: string;
  categoryIcon: string;
};

/** Sum of amounts for one category type. Postgres returns sums as strings, hence Number. */
export function sumByType(type: "INCOME" | "EXPENSE") {
  return sql<number>`coalesce(sum(${transactions.amount}) filter (where ${categories.type} = ${type}), 0)`.mapWith(
    Number,
  );
}

export const transactionRowColumns = {
  id: transactions.id,
  amount: transactions.amount,
  date: transactions.date,
  note: transactions.note,
  categoryId: categories.id,
  categoryName: categories.name,
  categoryType: categories.type,
  categoryColor: categories.color,
  categoryIcon: categories.icon,
};

export async function getTransactions(userId: string, filters: TransactionFilters) {
  // userId is always the first condition: a user can only ever see their own rows.
  const conditions: (SQL | undefined)[] = [eq(transactions.userId, userId)];

  if (filters.month !== "all") {
    const { start, end } = monthRange(filters.month);
    conditions.push(gte(transactions.date, start), lt(transactions.date, end));
  }
  if (filters.type !== "ALL") conditions.push(eq(categories.type, filters.type));
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters.q) {
    const pattern = `%${escapeLike(filters.q)}%`;
    conditions.push(or(ilike(transactions.note, pattern), ilike(categories.name, pattern)));
  }
  const where = and(...conditions);

  const [rows, [summary]] = await Promise.all([
    db
      .select(transactionRowColumns)
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where)
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db
      .select({ total: count(), income: sumByType("INCOME"), expenses: sumByType("EXPENSE") })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where),
  ]);

  return {
    rows: rows as TransactionRow[],
    total: summary.total,
    income: summary.income,
    expenses: summary.expenses,
    pageCount: Math.max(1, Math.ceil(summary.total / PAGE_SIZE)),
  };
}
