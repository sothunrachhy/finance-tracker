import "server-only";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { budgets, categories, transactions, users } from "@/db/schema";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { currentMonth, shiftMonth } from "@/lib/dates";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db-errors";
import { DEMO_BUDGETS, DEMO_MONTHS_BACK, generateDemoTransactions } from "@/lib/demo-data";

export const DEMO_EMAIL = "demo@financetracker.app";

/**
 * Returns the demo account's id, creating it on first use. The data is rebuilt
 * once a month so the demo always shows recent activity.
 */
export async function ensureDemoUser(): Promise<string> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, DEMO_EMAIL),
    columns: { id: true, createdAt: true },
  });

  if (existing && currentMonth(existing.createdAt) === currentMonth()) return existing.id;
  return resetDemoUser();
}

/** Deletes the demo account (cascading to its data) and creates it again. */
export async function resetDemoUser(): Promise<string> {
  await db.delete(users).where(eq(users.email, DEMO_EMAIL));
  try {
    return await createDemoUser();
  } catch (error) {
    // Two visitors clicked "Try demo" at the same moment; use the account the other one made.
    if (!isUniqueViolation(error)) throw error;
    const user = await db.query.users.findFirst({ where: eq(users.email, DEMO_EMAIL) });
    if (!user) throw error;
    return user.id;
  }
}

async function createDemoUser(): Promise<string> {
  // Random password: the demo account is only reachable through the demo button.
  const passwordHash = await bcrypt.hash(randomUUID(), 10);
  const now = new Date();

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ name: "Demo User", email: DEMO_EMAIL, passwordHash })
      .returning({ id: users.id });

    const createdCategories = await tx
      .insert(categories)
      .values(DEFAULT_CATEGORIES.map((category) => ({ ...category, userId: user.id })))
      .returning({ id: categories.id, name: categories.name });
    const categoryId = new Map(createdCategories.map((c) => [c.name, c.id]));

    await tx.insert(transactions).values(
      generateDemoTransactions(now).map((t) => ({
        userId: user.id,
        categoryId: categoryId.get(t.category)!,
        amount: t.amount,
        date: t.date,
        note: t.note,
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
