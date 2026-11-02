// Amounts are stored as integers in minor units (cents). Every supported currency
// uses exactly 2 decimal places, so 1 major unit is always 100 minor units and a
// stored amount keeps its meaning if the user switches display currency.
export const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "KHR", name: "Cambodian Riel" },
  { code: "THB", name: "Thai Baht" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [CurrencyCode, ...CurrencyCode[]];

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

/** Formats cents for display, e.g. 123456 -> "$1,234.56". */
export function formatMoney(
  cents: number,
  currency: string,
  options: { signDisplay?: "auto" | "always" | "exceptZero"; compact?: boolean } = {},
): string {
  // A fixed locale keeps server and browser output identical (no hydration mismatch).
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    signDisplay: options.signDisplay ?? "auto",
    ...(options.compact && { notation: "compact", maximumFractionDigits: 1 }),
  }).format(cents / 100);
}
