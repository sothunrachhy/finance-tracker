import { z } from "zod";
import type { TranslationKey } from "@/i18n/translator";
import { CATEGORY_COLORS, CATEGORY_ICON_NAMES } from "@/lib/categories";
import {
  isValidISODate,
  isValidMonth,
  MIN_TRANSACTION_DATE,
  maxTransactionDate,
} from "@/lib/dates";
import { CURRENCY_CODES, MAX_AMOUNT_CENTS, parseAmountToCents } from "@/lib/money";

// Shared validation rules for every Server Action. Error messages are translation
// keys (e.g. "validation.email"); the action translates them into the user's
// language before returning them to the form.

type ValidationKey = Extract<TranslationKey, `validation.${string}`>;
const msg = (key: ValidationKey) => key;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email(msg("validation.email")));

const password = z
  .string()
  .min(8, msg("validation.passwordMin"))
  .max(72, msg("validation.passwordMax")); // bcrypt ignores bytes past 72

const name = z
  .string()
  .trim()
  .min(1, msg("validation.nameRequired"))
  .max(50, msg("validation.nameTooLong"));

/** Accepts "12.50" style input and outputs integer cents. */
const amount = z
  .string()
  .transform((value, ctx) => {
    const cents = parseAmountToCents(value);
    if (cents === null) {
      // A well-formed number only fails to parse when it's too big to store
      const wellFormed = /^\s*\d[\d,]*(\.\d{1,2})?\s*$/.test(value);
      ctx.addIssue({
        code: "custom",
        message: msg(wellFormed ? "validation.amountTooLarge" : "validation.amountFormat"),
      });
      return z.NEVER;
    }
    return cents;
  })
  .pipe(
    z
      .number()
      .int()
      .positive(msg("validation.amountPositive"))
      .max(MAX_AMOUNT_CENTS, msg("validation.amountTooLarge")),
  );

const id = z.uuid(msg("validation.invalidId"));

export const registerSchema = z.object({ name, email, password });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, msg("validation.passwordRequired")),
});

export const transactionSchema = z.object({
  categoryId: z.uuid(msg("validation.chooseCategory")),
  amount,
  date: z
    .string()
    .refine(isValidISODate, { message: msg("validation.date"), abort: true })
    .refine((date) => date >= MIN_TRANSACTION_DATE, msg("validation.dateTooEarly"))
    .refine((date) => date <= maxTransactionDate(), msg("validation.dateTooLate")),
  note: z
    .string()
    .trim()
    .max(200, msg("validation.noteTooLong"))
    .transform((v) => v || null),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, msg("validation.nameRequired"))
    .max(30, msg("validation.nameTooLong")),
  type: z.enum(["INCOME", "EXPENSE"], msg("validation.chooseType")),
  color: z.enum(CATEGORY_COLORS, msg("validation.chooseColor")),
  icon: z.enum(CATEGORY_ICON_NAMES, msg("validation.chooseIcon")),
});

export const budgetSchema = z.object({
  categoryId: z.uuid(msg("validation.chooseCategory")),
  month: z.string().refine(isValidMonth, msg("validation.invalidMonth")),
  amount,
});

export const profileSchema = z.object({
  name,
  currency: z.enum(CURRENCY_CODES, msg("validation.chooseCurrency")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, msg("validation.currentPasswordRequired")),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: msg("validation.passwordsMismatch"),
    path: ["confirmPassword"],
  });

export { id as idSchema };
