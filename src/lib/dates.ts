import type { Locale } from "@/i18n/config";

// Months are "YYYY-MM" strings and days are "YYYY-MM-DD" strings, matching the
// Postgres `date` columns. All math is done in UTC so results never shift with the
// timezone of the server or browser.

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function isValidMonth(value: unknown): value is string {
  return typeof value === "string" && MONTH_PATTERN.test(value);
}

export function isValidISODate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects impossible dates like 2026-02-30, which Date would silently roll over.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function toISODate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// Transactions must fall in this window, so typos like 2099 or 1926 can't slip in
export const MIN_TRANSACTION_DATE = "2000-01-01";

/** The latest allowed transaction date: one year from today (room for planned payments). */
export function maxTransactionDate(now: Date = new Date()): string {
  const date = new Date(now);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return toISODate(date);
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function currentMonth(now: Date = new Date()): string {
  return todayISO(now).slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

/** Date range covering a month: `start` inclusive, `end` exclusive. */
export function monthRange(month: string): { start: string; end: string } {
  return { start: `${month}-01`, end: `${shiftMonth(month, 1)}-01` };
}

export function daysInMonth(month: string): number {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
}

/** The last `count` months ending with `month`, oldest first. */
export function recentMonths(month: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => shiftMonth(month, i - count + 1));
}

// Browsers ship without Khmer date data (Intl silently falls back to English), so
// Khmer month names come from this table to match on server and browser.
const KHMER_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

export function formatMonth(
  month: string,
  style: "long" | "short" = "long",
  locale: Locale = "en",
): string {
  if (locale === "km") {
    const [year, monthNumber] = month.split("-");
    return `${KHMER_MONTHS[Number(monthNumber) - 1]} ${style === "long" ? year : year.slice(2)}`;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: style,
    year: style === "long" ? "numeric" : "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

export function formatDate(isoDate: string, locale: Locale = "en"): string {
  if (locale === "km") {
    const [year, month, day] = isoDate.split("-");
    return `${Number(day)} ${KHMER_MONTHS[Number(month) - 1]} ${year}`;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
