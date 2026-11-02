"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { categories, users } from "@/db/schema";
import { localePath } from "@/i18n/config";
import { getRequestI18n } from "@/i18n/request";
import { defaultCategoriesFor } from "@/lib/categories";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db-errors";
import { fieldErrors, type FormState, formValues } from "@/lib/form-state";
import { createSession, deleteSession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validation";
import { ensureDemoUser } from "@/server/demo";

const BCRYPT_ROUNDS = 12;

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const { locale, t } = await getRequestI18n();
  const input = formValues(formData, ["name", "email", "password"]);
  const values = { name: input.name, email: input.email }; // never echo the password back

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t), values };

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let userId: string;
  try {
    userId = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ name, email, passwordHash })
        .returning({ id: users.id });
      // Starter categories in the language the user signed up in
      await tx
        .insert(categories)
        .values(defaultCategoriesFor(locale).map((category) => ({ ...category, userId: user.id })));
      return user.id;
    });
  } catch (error) {
    // The unique index on email is the source of truth, so there's no check-then-insert race.
    if (isUniqueViolation(error)) {
      return { fieldErrors: { email: [t("messages.emailTaken")] }, values };
    }
    throw error;
  }

  await createSession(userId);
  redirect(localePath(locale, "/dashboard"));
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const { locale, t } = await getRequestI18n();
  const input = formValues(formData, ["email", "password", "next"]);
  const values = { email: input.email };

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t), values };

  const user = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
    columns: { id: true, passwordHash: true },
  });

  // One message for both cases, so the form can't be used to find out which emails exist.
  const valid = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!valid) return { message: t("messages.invalidCredentials"), values };

  await createSession(user.id);
  redirect(safeRedirectPath(input.next, localePath(locale, "/dashboard")));
}

export async function loginAsDemo(): Promise<void> {
  const { locale } = await getRequestI18n();
  const userId = await ensureDemoUser(locale);
  await createSession(userId);
  redirect(localePath(locale, "/dashboard"));
}

export async function logout(): Promise<void> {
  const { locale } = await getRequestI18n();
  await deleteSession();
  redirect(localePath(locale, "/"));
}

/** Only allow same-site paths, so `?next=https://evil.com` can't be used for phishing. */
function safeRedirectPath(next: string, fallback: string): string {
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : fallback;
}
