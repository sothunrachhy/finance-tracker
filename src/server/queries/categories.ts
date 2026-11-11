import "server-only";
import { count, eq } from "drizzle-orm";
import { categories, transactions } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { db } from "@/lib/db";
import { alphabetical, categoryName } from "./category-name";

export type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
};

export async function getCategories(userId: string, locale: Locale): Promise<CategoryOption[]> {
  const name = categoryName(locale);
  return db
    .select({
      id: categories.id,
      name,
      type: categories.type,
      color: categories.color,
      icon: categories.icon,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(...alphabetical(name));
}

export type CategoryWithUsage = CategoryOption & { transactionCount: number };

export async function getCategoriesWithUsage(
  userId: string,
  locale: Locale,
): Promise<CategoryWithUsage[]> {
  const name = categoryName(locale);
  return db
    .select({
      id: categories.id,
      name,
      type: categories.type,
      color: categories.color,
      icon: categories.icon,
      transactionCount: count(transactions.id),
    })
    .from(categories)
    .leftJoin(transactions, eq(transactions.categoryId, categories.id))
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(...alphabetical(name));
}
