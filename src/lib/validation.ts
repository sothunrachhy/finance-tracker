import { z } from "zod";
import { CATEGORY_COLORS, CATEGORY_ICON_NAMES } from "@/lib/categories";
import { isValidISODate, isValidMonth } from "@/lib/dates";
import { CURRENCY_CODES, MAX_AMOUNT_CENTS, parseAmountToCents } from "@/lib/money";

// Shared by the forms (client) and the Server Actions (server), so the rules
// can never drift apart.

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters"); // bcrypt ignores bytes past 72

const name = z.string().trim().min(1, "Name is required").max(50, "Name is too long");

/** Accepts "12.50" style input and outputs integer cents. */
const amount = z
  .string()
  .transform((value, ctx) => {
    const cents = parseAmountToCents(value);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Enter an amount like 12.50" });
      return z.NEVER;
    }
    return cents;
  })
  .pipe(
    z
      .number()
      .int()
      .positive("Amount must be greater than 0")
      .max(MAX_AMOUNT_CENTS, "Amount is too large"),
  );

const id = z.uuid("Invalid id");

export const registerSchema = z.object({ name, email, password });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const transactionSchema = z.object({
  categoryId: z.uuid("Choose a category"),
  amount,
  date: z.string().refine(isValidISODate, "Enter a valid date"),
  note: z
    .string()
    .trim()
    .max(200, "Note is too long")
    .transform((v) => v || null),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(30, "Name is too long"),
  type: z.enum(["INCOME", "EXPENSE"], "Choose income or expense"),
  color: z.enum(CATEGORY_COLORS, "Choose a color"),
  icon: z.enum(CATEGORY_ICON_NAMES, "Choose an icon"),
});

export const budgetSchema = z.object({
  categoryId: z.uuid("Choose a category"),
  month: z.string().refine(isValidMonth, "Invalid month"),
  amount,
});

export const profileSchema = z.object({
  name,
  currency: z.enum(CURRENCY_CODES, "Choose a currency"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export { id as idSchema };
