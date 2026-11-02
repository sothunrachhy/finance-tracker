"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { categories } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db-errors";
import { fieldErrors, type FormState, formValues } from "@/lib/form-state";
import { categorySchema, idSchema } from "@/lib/validation";
import type { ActionResult } from "@/server/actions/transactions";

const FIELDS = ["name", "type", "color", "icon"] as const;

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const values = formValues(formData, FIELDS);
  const id = formData.get("id");

  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  try {
    if (id) {
      const categoryId = idSchema.safeParse(id);
      if (!categoryId.success) return { message: "Category not found", values };

      // Type can't change after creation: it would silently flip every past
      // transaction in this category between income and expense.
      const { name, color, icon } = parsed.data;
      const updated = await db
        .update(categories)
        .set({ name, color, icon })
        .where(and(eq(categories.id, categoryId.data), eq(categories.userId, userId)))
        .returning({ id: categories.id });
      if (updated.length === 0) return { message: "Category not found", values };
    } else {
      await db.insert(categories).values({ ...parsed.data, userId });
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { name: ["You already have a category with this name"] }, values };
    }
    throw error;
  }

  refresh();
  return { ok: true, message: id ? "Category updated" : "Category added" };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: "Category not found" };

  try {
    const deleted = await db
      .delete(categories)
      .where(and(eq(categories.id, parsedId.data), eq(categories.userId, userId)))
      .returning({ id: categories.id });
    if (deleted.length === 0) return { ok: false, message: "Category not found" };
  } catch (error) {
    // The foreign key is ON DELETE RESTRICT, so the database itself refuses.
    if (isForeignKeyViolation(error)) {
      return {
        ok: false,
        message: "This category still has transactions. Delete or re-categorize them first.",
      };
    }
    throw error;
  }

  refresh();
  return { ok: true, message: "Category deleted" };
}
