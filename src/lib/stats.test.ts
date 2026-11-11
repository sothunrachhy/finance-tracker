import { describe, expect, it } from "vitest";
import { budgetStatus, formatPercent, niceTicks, savingsRate } from "./stats";

describe("budgetStatus", () => {
  it.each([
    [0, 100_00, "ok"],
    [79_99, 100_00, "ok"],
    [80_00, 100_00, "warning"],
    [99_99, 100_00, "warning"],
    [100_00, 100_00, "limit"],
    [100_01, 100_00, "over"],
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

describe("niceTicks", () => {
  it("uses round steps instead of fractions like 2.3K", () => {
    expect(niceTicks(4756)).toEqual([0, 2000, 4000, 6000]);
    expect(niceTicks(9000)).toEqual([0, 2500, 5000, 7500, 10000]);
    expect(niceTicks(3)).toEqual([0, 1, 2, 3]);
    expect(niceTicks(120)).toEqual([0, 50, 100, 150]);
  });

  it("returns a single tick when there's no data", () => {
    expect(niceTicks(0)).toEqual([0]);
  });
});

describe("formatPercent", () => {
  it("rounds to whole percents", () => {
    expect(formatPercent(0.456)).toBe("46%");
  });
});
