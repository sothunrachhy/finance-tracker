import "server-only";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { budgets, categories, transactions, users } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { DEFAULT_CATEGORIES, defaultCategoriesFor } from "@/lib/categories";
import { currentMonth, shiftMonth } from "@/lib/dates";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db-errors";
import {
  DEMO_BUDGETS,
  DEMO_MONTHS_BACK,
  generateDemoTransactions,
  localizeDemoNote,
} from "@/lib/demo-data";

// One shared demo account per language, so Khmer visitors see Khmer categories and notes.
export const DEMO_ACCOUNTS: Record<Locale, { email: string; name: string }> = {
  en: { email: "demo@financetracker.app", name: "Demo User" },
  km: { email: "demo.km@financetracker.app", name: "អ្នកសាកល្បង" },
};

export function isDemoEmail(email: string): boolean {
  return Object.values(DEMO_ACCOUNTS).some((account) => account.email === email);
}

/**
 * Returns the demo account's id, creating it on first use. The data is rebuilt
 * once a month so the demo always shows recent activity.
 */
export async function ensureDemoUser(locale: Locale): Promise<string> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, DEMO_ACCOUNTS[locale].email),
    columns: { id: true, createdAt: true },
  });

  if (existing && currentMonth(existing.createdAt) === currentMonth()) return existing.id;
  return resetDemoUser(locale);
}

/** Deletes the demo account (cascading to its data) and creates it again. */
export async function resetDemoUser(locale: Locale): Promise<string> {
  const { email } = DEMO_ACCOUNTS[locale];
  await db.delete(users).where(eq(users.email, email));
  try {
    return await createDemoUser(locale);
  } catch (error) {
    // Two visitors clicked "Try demo" at the same moment; use the account the other one made.
    if (!isUniqueViolation(error)) throw error;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) throw error;
    return user.id;
  }
}

async function createDemoUser(locale: Locale): Promise<string> {
  // Random password: the demo account is only reachable through the demo button.
  const passwordHash = await bcrypt.hash(randomUUID(), 10);
  const now = new Date();
  const { email, name } = DEMO_ACCOUNTS[locale];
  const localizedCategories = defaultCategoriesFor(locale);

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id });

    const createdCategories = await tx
      .insert(categories)
      .values(localizedCategories.map((category) => ({ ...category, userId: user.id })))
      .returning({ id: categories.id, name: categories.name });

    // The demo data refers to categories by their English name
    const englishName = new Map(
      localizedCategories.map((c, i) => [c.name, DEFAULT_CATEGORIES[i].name]),
    );
    const categoryId = new Map(createdCategories.map((c) => [englishName.get(c.name), c.id]));

    await tx.insert(transactions).values(
      generateDemoTransactions(now).map((t) => ({
        userId: user.id,
        categoryId: categoryId.get(t.category)!,
        amount: t.amount,
        date: t.date,
        note: localizeDemoNote(t.note, locale),
      })),
    );

    const month = currentMonth(now);
    const budgetRows = [];
    for (let offset = -DEMO_MONTHS_BACK; offset <= 0; offset++) {
      for (const budget of DEMO_BUDGETS) {
        budgetRows.push({
          userId: user.id,
          categoryId: categoryId.get(budget.category)!,
          month: `${shiftMonth(month, offset)}-01`,
          amount: budget.amount,
        });
      }
    }
    await tx.insert(budgets).values(budgetRows);

    return user.id;
  });
}
