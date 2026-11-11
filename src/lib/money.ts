// Amounts are stored as integers in minor units (cents). Every currency is stored with
// 2 decimal places, so 1 major unit is always 100 minor units and a stored amount
// keeps its number if the user switches display currency. Riel is shown without them.
import type { Locale } from "@/i18n/config";

export const CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "KHR",
  "THB",
  "SGD",
  "MYR",
  "PHP",
  "CNY",
  "INR",
  "AUD",
  "CAD",
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

// Chrome and Edge ship without Khmer locale data, so Intl quietly falls back to
// English in the browser while Node formats real Khmer. Khmer output is therefore
// built from these tables instead, so server and browser always render the same text.
const KHMER_CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: "ដុល្លារអាមេរិក",
  EUR: "អឺរ៉ូ",
  GBP: "ផោនអង់គ្លេស",
  KHR: "រៀលកម្ពុជា",
  THB: "បាតថៃ",
  SGD: "ដុល្លារសិង្ហបុរី",
  MYR: "រីងហ្គីតម៉ាឡេស៊ី",
  PHP: "ប៉េសូហ្វីលីពីន",
  CNY: "យន់ចិន",
  INR: "រូពីឥណ្ឌា",
  AUD: "ដុល្លារអូស្ត្រាលី",
  CAD: "ដុល្លារកាណាដា",
};

/** The currency's name in the given language, e.g. ("KHR", "km") -> "រៀលកម្ពុជា" */
export function currencyName(code: string, locale: Locale = "en"): string {
  if (locale === "km") return KHMER_CURRENCY_NAMES[code as CurrencyCode] ?? code;
  return new Intl.DisplayNames("en-US", { type: "currency" }).of(code) ?? code;
}

/**
 * Decimal places shown and accepted for a currency. Riel has no coins in use, so it's
 * entered and shown in whole riel (still stored as minor units, ×100, like the rest).
 */
export function currencyDecimals(currency: string): 0 | 2 {
  return currency === "KHR" ? 0 : 2;
}

// Largest single amount we accept, in major units: 10,000,000.00 in most currencies.
// Riel is worth far less (about 4,000 to the dollar), so it gets 1,000,000,000៛.
const MAX_AMOUNT: Partial<Record<string, number>> = { KHR: 1_000_000_000 };
const DEFAULT_MAX_AMOUNT = 10_000_000;

/** The largest single amount for a currency, in minor units. */
export function maxAmountCents(currency: string): number {
  return (MAX_AMOUNT[currency] ?? DEFAULT_MAX_AMOUNT) * 100;
}

/**
 * Parses user input like "12", "12.5", "1,234.56" into cents without ever going
 * through floating point. Returns null for anything that isn't a valid amount.
 * With `decimals` 0 (riel) only whole numbers are accepted.
 */
export function parseAmountToCents(input: string, decimals: 0 | 2 = 2): number | null {
  const value = input.trim().replace(/,/g, "");
  const pattern = decimals === 0 ? /^\d+$/ : /^\d+(\.\d{1,2})?$/;
  if (!pattern.test(value)) return null;

  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Formats cents as a plain number for form inputs: 1250 -> "12.50" (or "13" for riel). */
export function centsToInput(cents: number, decimals: 0 | 2 = 2): string {
  if (decimals === 0) return String(Math.round(cents / 100));
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}

/** Formats cents for display: 123456 -> "$1,234.56" (English) or "1,234.56$" (Khmer). */
export function formatMoney(
  cents: number,
  currency: string,
  options: {
    signDisplay?: "auto" | "always" | "exceptZero";
    compact?: boolean;
    locale?: Locale;
  } = {},
): string {
  const signDisplay = options.signDisplay ?? "auto";
  const decimals = currencyDecimals(currency);
  const digits = options.compact
    ? ({ notation: "compact", maximumFractionDigits: 1 } as const)
    : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };

  // Khmer puts the symbol after the number ("1,234.56$", compact "4.5K$"). Built by
  // hand from the English number format, see above.
  if (options.locale === "km") {
    const number = new Intl.NumberFormat("en-US", { signDisplay, ...digits }).format(cents / 100);
    return `${number}${currencySymbol(currency)}`;
  }

  // A fixed locale (never the machine's default) keeps server and browser output identical
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    signDisplay,
    ...digits,
  }).format(cents / 100);
}

/** "$" for USD, "៛" for KHR, "€" for EUR... */
function currencySymbol(currency: string): string {
  return (
    new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  );
}
