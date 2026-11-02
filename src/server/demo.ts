import "server-only";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { and, ilike, inArray, lt, or } from "drizzle-orm";
import { budgets, categories, transactions, users } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { defaultCategoriesFor } from "@/lib/categories";
import { currentMonth, shiftMonth } from "@/lib/dates";
import { db } from "@/lib/db";
import {
  DEMO_BUDGETS,
  DEMO_MONTHS_BACK,
  generateDemoTransactions,
  localizeDemoNote,
} from "@/lib/demo-data";

// Every click on "Try the demo" creates a private copy of the sample data, so one
// visitor's changes never show up for another. Copies are deleted after a day.
const DEMO_DOMAIN = "demo.financetracker.app";
const DEMO_LIFETIME_MS = 24 * 60 * 60 * 1000;
const DEMO_NAMES: Record<Locale, string> = { en: "Demo User", km: "អ្នកសាកល្បង" };
// The shared accounts used before private copies existed
const LEGACY_DEMO_EMAILS = ["demo@financetracker.app", "demo.km@financetracker.app"];

export function isDemoEmail(email: string): boolean {
  return email.endsWith(`@${DEMO_DOMAIN}`) || LEGACY_DEMO_EMAILS.includes(email);
}

/** Deletes demo copies older than `maxAgeMs` (cascading to their data). Returns how many. */
export async function deleteExpiredDemoUsers(maxAgeMs = DEMO_LIFETIME_MS): Promise<number> {
  const deleted = await db
    .delete(users)
    .where(
      or(
        and(
          ilike(users.email, `%@${DEMO_DOMAIN}`),
          lt(users.createdAt, new Date(Date.now() - maxAgeMs)),
        ),
        inArray(users.email, LEGACY_DEMO_EMAILS),
      ),
    )
    .returning({ id: users.id });
  return deleted.length;
}

/** Creates a fresh, private demo account in the visitor's language and returns its id. */
export async function createDemoUser(locale: Locale): Promise<string> {
  // Housekeeping on the way in, so old copies never pile up
  await deleteExpiredDemoUsers();

  // Random password: a demo account is only reachable through the demo button.
  const passwordHash = await bcrypt.hash(randomUUID(), 10);
  const now = new Date();
  const email = `${randomUUID()}@${DEMO_DOMAIN}`;
  const name = DEMO_NAMES[locale];

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id });

    const createdCategories = await tx
      .insert(categories)
      .values(defaultCategoriesFor(locale).map((category) => ({ ...category, userId: user.id })))
      .returning({ id: categories.id, key: categories.defaultKey });

    // The demo data refers to categories by their English name
    const englishNames = dictionaries.en.categoryNames as Record<string, string>;
    const categoryId = new Map(createdCategories.map((c) => [englishNames[c.key!], c.id]));

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
