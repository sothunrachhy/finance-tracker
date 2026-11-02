import { describe, expect, it } from "vitest";
import { escapeLike, parseTransactionFilters } from "./filters";

const now = new Date("2026-11-15T12:00:00Z");

describe("parseTransactionFilters", () => {
  it("falls back to sensible defaults", () => {
    expect(parseTransactionFilters({}, now)).toEqual({
      month: "2026-11",
      type: "ALL",
      categoryId: null,
      q: "",
      page: 1,
    });
  });

  it("reads valid params", () => {
    const filters = parseTransactionFilters(
      {
        month: "2026-08",
        type: "income",
        category: "0b8c6f1e-3d7a-4c1b-9a2e-5f6d7e8c9b0a",
        q: "  coffee ",
        page: "3",
      },
      now,
    );
    expect(filters).toEqual({
      month: "2026-08",
      type: "INCOME",
      categoryId: "0b8c6f1e-3d7a-4c1b-9a2e-5f6d7e8c9b0a",
      q: "coffee",
      page: 3,
    });
  });

  it("accepts 'all' as a month", () => {
    expect(parseTransactionFilters({ month: "all" }, now).month).toBe("all");
  });

  it("ignores garbage instead of crashing the query", () => {
    const filters = parseTransactionFilters(
      { month: "2026-13", type: "both", category: "1; drop table users", page: "-2" },
      now,
    );
    expect(filters.month).toBe("2026-11");
    expect(filters.type).toBe("ALL");
    expect(filters.categoryId).toBeNull();
    expect(filters.page).toBe(1);
  });

  it("uses the first value when a param repeats", () => {
    expect(parseTransactionFilters({ type: ["expense", "income"] }, now).type).toBe("EXPENSE");
  });
});

describe("escapeLike", () => {
  it("escapes LIKE wildcards", () => {
    expect(escapeLike("50%_off\\")).toBe("50\\%\\_off\\\\");
  });
});
