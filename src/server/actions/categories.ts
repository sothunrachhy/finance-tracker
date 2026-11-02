"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { categories } from "@/db/schema";
import { getRequestI18n } from "@/i18n/request";
import { requireUserId } from "@/lib/auth";
import { defaultCategoryName } from "@/lib/categories";
import { db } from "@/lib/db";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db-errors";
import { fieldErrors, type FormState, formValues } from "@/lib/form-state";
import { categorySchema, idSchema } from "@/lib/validation";
import type { ActionResult } from "@/server/actions/transactions";

const FIELDS = ["name", "type", "color", "icon"] as const;

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const { locale, t } = await getRequestI18n();
  const values = formValues(formData, FIELDS);
  const id = formData.get("id");

  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t), values };

  try {
    if (id) {
      const categoryId = idSchema.safeParse(id);
      if (!categoryId.success) return { message: t("messages.categoryNotFound"), values };

      const where = and(eq(categories.id, categoryId.data), eq(categories.userId, userId));
      const existing = await db.query.categories.findFirst({
        where,
        columns: { name: true, defaultKey: true },
      });
      if (!existing) return { message: t("messages.categoryNotFound"), values };

      // A starter category keeps following the app's language until the user
      // actually changes the name they were shown.
      const { name, color, icon } = parsed.data;
      const shownName = existing.defaultKey
        ? defaultCategoryName(existing.defaultKey, locale)
        : existing.name;
      const renamed = name !== shownName;

      // Type can't change after creation: it would silently flip every past
      // transaction in this category between income and expense.
      await db
        .update(categories)
        .set({ color, icon, ...(renamed && { name, defaultKey: null }) })
        .where(where);
    } else {
      await db.insert(categories).values({ ...parsed.data, userId });
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { name: [t("messages.categoryNameTaken")] }, values };
    }
    throw error;
  }

  refresh();
  return { ok: true, message: t(id ? "messages.categoryUpdated" : "messages.categoryAdded") };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const { t } = await getRequestI18n();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: t("messages.categoryNotFound") };

  try {
    const deleted = await db
      .delete(categories)
      .where(and(eq(categories.id, parsedId.data), eq(categories.userId, userId)))
      .returning({ id: categories.id });
    if (deleted.length === 0) return { ok: false, message: t("messages.categoryNotFound") };
  } catch (error) {
    // The foreign key is ON DELETE RESTRICT, so the database itself refuses.
    if (isForeignKeyViolation(error)) {
      return { ok: false, message: t("messages.categoryInUse") };
    }
    throw error;
  }

  refresh();
  return { ok: true, message: t("messages.categoryDeleted") };
}
