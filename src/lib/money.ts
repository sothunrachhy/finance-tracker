// Amounts are stored as integers in minor units (cents). Every supported currency
// uses exactly 2 decimal places, so 1 major unit is always 100 minor units and a
// stored amount keeps its meaning if the user switches display currency.
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

// Largest single amount we accept: 10,000,000.00. Keeps sums far from int overflow.
export const MAX_AMOUNT_CENTS = 1_000_000_000;

/**
 * Parses user input like "12", "12.5", "1,234.56" into cents without ever going
 * through floating point. Returns null for anything that isn't a valid amount.
 */
export function parseAmountToCents(input: string): number | null {
  const value = input.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;

  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Formats cents as a plain decimal string for form inputs, e.g. 1250 -> "12.50". */
export function centsToInput(cents: number): string {
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

  // Khmer puts the symbol after the number ("1,234.56$"). Built by hand, see above.
  // Compact axis labels keep the shorter English form ("$4.5K") in both languages.
  if (options.locale === "km" && !options.compact) {
    const number = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay,
    }).format(cents / 100);
    return `${number}${currencySymbol(currency)}`;
  }

  // A fixed locale (never the machine's default) keeps server and browser output identical
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    signDisplay,
    ...(options.compact && { notation: "compact", maximumFractionDigits: 1 }),
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
