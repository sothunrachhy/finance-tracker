import { describe, expect, it } from "vitest";
import { DEFAULT_CATEGORIES } from "./categories";
import { DEMO_BUDGETS, generateDemoTransactions } from "./demo-data";

const now = new Date("2026-11-10T09:00:00Z");

describe("generateDemoTransactions", () => {
  const transactions = generateDemoTransactions(now);

  it("is deterministic", () => {
    expect(generateDemoTransactions(now)).toEqual(transactions);
  });

  it("never creates future transactions", () => {
    expect(transactions.every((t) => t.date <= "2026-11-10")).toBe(true);
  });

  it("covers the current month and the 5 before it", () => {
    const months = new Set(transactions.map((t) => t.date.slice(0, 7)));
    expect([...months].sort()).toEqual([
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
  });

  it("only uses default categories and positive integer amounts", () => {
    const names = new Set(DEFAULT_CATEGORIES.map((c) => c.name));
    for (const t of transactions) {
      expect(names.has(t.category)).toBe(true);
      expect(Number.isInteger(t.amount) && t.amount > 0).toBe(true);
    }
    for (const b of DEMO_BUDGETS) expect(names.has(b.category)).toBe(true);
  });

  it("is sorted newest first", () => {
    const dates = transactions.map((t) => t.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});
