import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { categories, transactions } from "@/db/schema";
import { db } from "@/lib/db";

export type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
};

export async function getCategories(userId: string): Promise<CategoryOption[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      color: categories.color,
      icon: categories.icon,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name));
}

export type CategoryWithUsage = CategoryOption & { transactionCount: number };

export async function getCategoriesWithUsage(userId: string): Promise<CategoryWithUsage[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      color: categories.color,
      icon: categories.icon,
      transactionCount: count(transactions.id),
    })
    .from(categories)
    .leftJoin(transactions, eq(transactions.categoryId, categories.id))
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}
