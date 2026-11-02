import { describe, expect, it } from "vitest";
import { budgetStatus, formatPercent, savingsRate } from "./stats";

describe("budgetStatus", () => {
  it.each([
    [0, 100_00, "ok"],
    [79_99, 100_00, "ok"],
    [80_00, 100_00, "warning"],
    [99_99, 100_00, "warning"],
    [100_00, 100_00, "over"],
    [150_00, 100_00, "over"],
  ])("spent %i of %i is %s", (spent, limit, expected) => {
    expect(budgetStatus(spent, limit)).toBe(expected);
  });
});

describe("savingsRate", () => {
  it("is the share of income not spent", () => {
    expect(savingsRate(1000, 250)).toBe(0.75);
    expect(savingsRate(1000, 1500)).toBe(-0.5);
  });

  it("is null without income", () => {
    expect(savingsRate(0, 100)).toBeNull();
  });
});

describe("formatPercent", () => {
  it("rounds to whole percents", () => {
    expect(formatPercent(0.456)).toBe("46%");
  });
});
