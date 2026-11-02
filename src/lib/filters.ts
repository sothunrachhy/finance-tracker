import { currentMonth, isValidMonth } from "@/lib/dates";

// The transactions page keeps its filters in the URL, so a filtered view can be
// bookmarked, shared, and survives a refresh.

export const PAGE_SIZE = 20;

export type TypeFilter = "ALL" | "INCOME" | "EXPENSE";

export type TransactionFilters = {
  /** "YYYY-MM", or "all" for every month */
  month: string;
  type: TypeFilter;
  categoryId: string | null;
  q: string;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Turns untrusted URL params into safe filters, falling back to defaults. */
export function parseTransactionFilters(
  params: SearchParams,
  now: Date = new Date(),
): TransactionFilters {
  const month = first(params.month);
  const type = first(params.type)?.toUpperCase();
  const categoryId = first(params.category);
  const page = Number(first(params.page));

  return {
    month: month === "all" || isValidMonth(month) ? month : currentMonth(now),
    type: type === "INCOME" || type === "EXPENSE" ? type : "ALL",
    categoryId: categoryId && UUID_PATTERN.test(categoryId) ? categoryId : null,
    q: (first(params.q) ?? "").trim().slice(0, 100),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Escapes LIKE wildcards so a search for "50%" matches literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
