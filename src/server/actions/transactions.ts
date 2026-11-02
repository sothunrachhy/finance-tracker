"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { categories, transactions } from "@/db/schema";
import { getRequestI18n } from "@/i18n/request";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, type FormState, formValues } from "@/lib/form-state";
import { idSchema, transactionSchema } from "@/lib/validation";

const FIELDS = ["categoryId", "amount", "date", "note"] as const;

export type ActionResult = { ok: boolean; message: string };

export async function saveTransaction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const { t } = await getRequestI18n();
  const values = formValues(formData, FIELDS);
  const id = formData.get("id");

  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t), values };

  // The category id comes from the browser, so make sure it belongs to this user.
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, parsed.data.categoryId), eq(categories.userId, userId)),
    columns: { id: true },
  });
  if (!category) return { fieldErrors: { categoryId: [t("validation.chooseCategory")] }, values };

  if (id) {
    const transactionId = idSchema.safeParse(id);
    if (!transactionId.success) return { message: t("messages.transactionNotFound"), values };

    const updated = await db
      .update(transactions)
      .set(parsed.data)
      .where(and(eq(transactions.id, transactionId.data), eq(transactions.userId, userId)))
      .returning({ id: transactions.id });
    if (updated.length === 0) return { message: t("messages.transactionNotFound"), values };
  } else {
    await db.insert(transactions).values({ ...parsed.data, userId });
  }

  refresh();
  return {
    ok: true,
    message: t(id ? "messages.transactionUpdated" : "messages.transactionAdded"),
  };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const { t } = await getRequestI18n();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: t("messages.transactionNotFound") };

  const deleted = await db
    .delete(transactions)
    .where(and(eq(transactions.id, parsedId.data), eq(transactions.userId, userId)))
    .returning({ id: transactions.id });
  if (deleted.length === 0) return { ok: false, message: t("messages.transactionNotFound") };

  refresh();
  return { ok: true, message: t("messages.transactionDeleted") };
}
