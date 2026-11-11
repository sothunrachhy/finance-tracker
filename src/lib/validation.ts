import { z } from "zod";
import type { TranslationKey } from "@/i18n/translator";
import { CATEGORY_COLORS, CATEGORY_ICON_NAMES } from "@/lib/categories";
import {
  isValidISODate,
  isValidMonth,
  MIN_TRANSACTION_DATE,
  maxTransactionDate,
} from "@/lib/dates";
import { CURRENCY_CODES, currencyDecimals, maxAmountCents, parseAmountToCents } from "@/lib/money";

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

// Not trimmed: a space can be a deliberate part of a password. But a password
// made only of whitespace is never acceptable.
const password = z
  .string()
  .min(8, msg("validation.passwordMin"))
  .max(72, msg("validation.passwordMax")) // bcrypt ignores bytes past 72
  .refine((value) => /\S/.test(value), msg("validation.passwordBlank"));

const name = z
  .string()
  .trim()
  .min(1, msg("validation.nameRequired"))
  .max(50, msg("validation.nameTooLong"));

/** Accepts "12.50" style input (whole numbers for riel) and outputs integer cents. */
function amount(currency: string) {
  const decimals = currencyDecimals(currency);
  const tooLarge = msg(
    currency === "KHR" ? "validation.amountTooLargeRiel" : "validation.amountTooLarge",
  );
  return z
    .string()
    .transform((value, ctx) => {
      const cents = parseAmountToCents(value, decimals);
      if (cents === null) {
        ctx.addIssue({ code: "custom", message: amountProblem(value, decimals, tooLarge) });
        return z.NEVER;
      }
      return cents;
    })
    .pipe(
      z
        .number()
        .int()
        .positive(msg("validation.amountPositive"))
        .max(maxAmountCents(currency), tooLarge),
    );
}

/** Says why an amount didn't parse, as specifically as possible. */
function amountProblem(value: string, decimals: 0 | 2, tooLarge: ValidationKey): ValidationKey {
  const trimmed = value.trim();
  if (/^-\s*\d/.test(trimmed)) return msg("validation.amountPositive");
  if (decimals === 0 && /^\d[\d,]*\.\d*$/.test(trimmed)) return msg("validation.amountWhole");
  // A well-formed number only fails to parse when it's too big to store
  if (/^\d[\d,]*(\.\d{1,2})?$/.test(trimmed)) return tooLarge;
  return msg(decimals === 0 ? "validation.amountFormatWhole" : "validation.amountFormat");
}

const id = z.uuid(msg("validation.invalidId"));

export const registerSchema = z.object({ name, email, password });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, msg("validation.passwordRequired")),
});

/** Amount limits and decimals depend on the user's currency. */
export function transactionSchema(currency: string) {
  return z.object({
    categoryId: z.uuid(msg("validation.chooseCategory")),
    amount: amount(currency),
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
}

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

export function budgetSchema(currency: string) {
  return z.object({
    categoryId: z.uuid(msg("validation.chooseCategory")),
    month: z.string().refine(isValidMonth, msg("validation.invalidMonth")),
    amount: amount(currency),
  });
}

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
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: msg("validation.passwordUnchanged"),
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().max(200),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: msg("validation.passwordsMismatch"),
    path: ["confirmPassword"],
  });

export { id as idSchema };
