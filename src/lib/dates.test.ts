import { describe, expect, it } from "vitest";
import {
  currentMonth,
  daysInMonth,
  formatMonth,
  isValidISODate,
  isValidMonth,
  monthRange,
  recentMonths,
  shiftMonth,
} from "./dates";

describe("month helpers", () => {
  it("shifts across year boundaries", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-03", -14)).toBe("2025-01");
  });

  it("builds an exclusive month range", () => {
    expect(monthRange("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
  });

  it("lists recent months oldest first", () => {
    expect(recentMonths("2026-02", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
  });

  it("knows leap years", () => {
    expect(daysInMonth("2028-02")).toBe(29);
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2026-04")).toBe(30);
  });

  it("uses UTC for the current month", () => {
    expect(currentMonth(new Date("2026-11-30T23:30:00Z"))).toBe("2026-11");
  });

  it("formats months", () => {
    expect(formatMonth("2026-11")).toBe("November 2026");
    expect(formatMonth("2026-11", "short")).toBe("Nov 26");
  });
});

describe("validation helpers", () => {
  it.each(["2026-01", "1999-12"])("accepts month %s", (value) => {
    expect(isValidMonth(value)).toBe(true);
  });

  it.each(["2026-13", "2026-00", "2026-1", "26-01", "", null, 202601])(
    "rejects month %j",
    (value) => {
      expect(isValidMonth(value)).toBe(false);
    },
  );

  it("rejects impossible dates instead of rolling them over", () => {
    expect(isValidISODate("2026-02-28")).toBe(true);
    expect(isValidISODate("2028-02-29")).toBe(true);
    expect(isValidISODate("2026-02-29")).toBe(false);
    expect(isValidISODate("2026-04-31")).toBe(false);
    expect(isValidISODate("2026-4-1")).toBe(false);
  });
});
