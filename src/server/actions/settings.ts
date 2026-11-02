"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { users } from "@/db/schema";
import { localePath } from "@/i18n/config";
import { getRequestI18n } from "@/i18n/request";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, type FormState, formValues } from "@/lib/form-state";
import { deleteSession } from "@/lib/session";
import { changePasswordSchema, profileSchema } from "@/lib/validation";
import type { ActionResult } from "@/server/actions/transactions";
import { isDemoEmail } from "@/server/demo";

async function getUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { email: true, passwordHash: true },
  });
  if (!user) redirect("/logout");
  return user;
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const { t } = await getRequestI18n();
  const values = formValues(formData, ["name", "currency"]);

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t), values };

  await db.update(users).set(parsed.data).where(eq(users.id, userId));

  refresh();
  return { ok: true, message: t("messages.profileSaved"), values };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const { t } = await getRequestI18n();
  const input = formValues(formData, ["currentPassword", "newPassword", "confirmPassword"]);

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t) };

  const user = await getUser(userId);
  if (isDemoEmail(user.email)) return { message: t("messages.demoLocked") };

  if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return { fieldErrors: { currentPassword: [t("messages.wrongPassword")] } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

  return { ok: true, message: t("messages.passwordChanged") };
}

export async function deleteAccount(): Promise<ActionResult> {
  const userId = await requireUserId();
  const { locale, t } = await getRequestI18n();
  const user = await getUser(userId);
  if (isDemoEmail(user.email)) return { ok: false, message: t("messages.demoLocked") };

  // Cascades to categories, transactions and budgets
  await db.delete(users).where(eq(users.id, userId));
  await deleteSession();
  redirect(localePath(locale, "/"));
}
