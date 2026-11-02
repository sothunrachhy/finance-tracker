"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { budgets, categories } from "@/db/schema";
import { getRequestI18n } from "@/i18n/request";
import { requireUserId } from "@/lib/auth";
import { isValidMonth, shiftMonth } from "@/lib/dates";
import { db } from "@/lib/db";
import { fieldErrors, type FormState, formValues } from "@/lib/form-state";
import { budgetSchema, idSchema } from "@/lib/validation";
import type { ActionResult } from "@/server/actions/transactions";

/** Creates or updates the budget for one category in one month. */
export async function saveBudget(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const { t } = await getRequestI18n();
  const values = formValues(formData, ["categoryId", "month", "amount"]);

  const parsed = budgetSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t), values };
  const { categoryId, month, amount } = parsed.data;

  // Must be one of this user's *expense* categories
  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, categoryId),
      eq(categories.userId, userId),
      eq(categories.type, "EXPENSE"),
    ),
    columns: { id: true },
  });
  if (!category) {
    return { fieldErrors: { categoryId: [t("messages.chooseExpenseCategory")] }, values };
  }

  // Upsert on the unique (user, category, month) index: one budget per category per month
  await db
    .insert(budgets)
    .values({ userId, categoryId, month: `${month}-01`, amount })
    .onConflictDoUpdate({
      target: [budgets.userId, budgets.categoryId, budgets.month],
      set: { amount },
    });

  refresh();
  return { ok: true, message: t("messages.budgetSaved") };
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const { t } = await getRequestI18n();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: t("messages.budgetNotFound") };

  const deleted = await db
    .delete(budgets)
    .where(and(eq(budgets.id, parsedId.data), eq(budgets.userId, userId)))
    .returning({ id: budgets.id });
  if (deleted.length === 0) return { ok: false, message: t("messages.budgetNotFound") };

  refresh();
  return { ok: true, message: t("messages.budgetRemoved") };
}

/** Copies last month's budgets into `month`, keeping any that already exist. */
export async function copyBudgetsFromPreviousMonth(month: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const { t } = await getRequestI18n();
  if (!isValidMonth(month)) return { ok: false, message: t("validation.invalidMonth") };

  const previous = await db
    .select({ categoryId: budgets.categoryId, amount: budgets.amount })
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.month, `${shiftMonth(month, -1)}-01`)));
  if (previous.length === 0) return { ok: false, message: t("messages.nothingToCopy") };

  const inserted = await db
    .insert(budgets)
    .values(previous.map((b) => ({ ...b, userId, month: `${month}-01` })))
    .onConflictDoNothing()
    .returning({ id: budgets.id });

  refresh();
  return {
    ok: true,
    message:
      inserted.length === 0
        ? t("messages.budgetsAlreadyExist")
        : t("messages.budgetsCopied", { count: inserted.length }),
  };
}
