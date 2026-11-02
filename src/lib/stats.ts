// Small pure helpers behind the dashboard and budgets (unit tested).

/** Share of income that wasn't spent, e.g. 0.25 for 25%. Null when there's no income. */
export function savingsRate(income: number, expenses: number): number | null {
  if (income <= 0) return null;
  return (income - expenses) / income;
}

export type BudgetStatus = "ok" | "warning" | "over";

export const BUDGET_WARNING_RATIO = 0.8;

/** Green below 80% of the limit, warning from 80%, over once the limit is reached. */
export function budgetStatus(spent: number, limit: number): BudgetStatus {
  const ratio = limit > 0 ? spent / limit : 1;
  if (ratio >= 1) return "over";
  if (ratio >= BUDGET_WARNING_RATIO) return "warning";
  return "ok";
}

/**
 * Round axis ticks from 0 up to at least `max`, about `count` steps apart, using
 * steps of 1, 2, 2.5 or 5 times a power of ten: 0, 2K, 4K, 6K instead of 0, 2.3K...
 */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough)!;
  const steps = Math.ceil(max / step);
  return Array.from({ length: steps + 1 }, (_, i) => i * step);
}

/** "46%". Khmer uses the same Latin digits and sign, so one format serves both languages. */
export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(ratio);
}
