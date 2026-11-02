import { describe, expect, it } from "vitest";
import { centsToInput, currencyName, formatMoney, parseAmountToCents } from "./money";

describe("parseAmountToCents", () => {
  it.each([
    ["12", 1200],
    ["12.5", 1250],
    ["12.50", 1250],
    ["0.01", 1],
    ["1,234.56", 123456],
    ["  7.10 ", 710],
  ])("parses %j as %i cents", (input, expected) => {
    expect(parseAmountToCents(input)).toBe(expected);
  });

  it("avoids floating point errors", () => {
    // 0.1 + 0.2 !== 0.3 in floats; string parsing never goes through floats
    expect(parseAmountToCents("0.29")).toBe(29);
    expect(parseAmountToCents("1.15")).toBe(115);
    expect(parseAmountToCents("19.99")).toBe(1999);
  });

  it.each(["", "abc", "12.345", "-5", "1e3", ".5", "12.", "1.2.3"])("rejects %j", (input) => {
    expect(parseAmountToCents(input)).toBeNull();
  });
});

describe("centsToInput", () => {
  it.each([
    [1250, "12.50"],
    [5, "0.05"],
    [100, "1.00"],
    [123456, "1234.56"],
  ])("formats %i as %s", (cents, expected) => {
    expect(centsToInput(cents)).toBe(expected);
  });

  it("round-trips with parseAmountToCents", () => {
    for (const cents of [1, 99, 100, 1999, 123456789]) {
      expect(parseAmountToCents(centsToInput(cents))).toBe(cents);
    }
  });
});

describe("formatMoney", () => {
  it("formats with the currency symbol", () => {
    expect(formatMoney(123456, "USD")).toBe("$1,234.56");
    expect(formatMoney(1050, "EUR")).toBe("€10.50");
  });

  it("can always show the sign", () => {
    expect(formatMoney(-1250, "USD", { signDisplay: "always" })).toBe("-$12.50");
    expect(formatMoney(1250, "USD", { signDisplay: "always" })).toBe("+$12.50");
  });

  it("formats Khmer with the symbol after the number", () => {
    expect(formatMoney(123456, "USD", { locale: "km" })).toBe("1,234.56$");
    expect(formatMoney(-1250, "USD", { locale: "km", signDisplay: "always" })).toBe("-12.50$");
    expect(formatMoney(4000000, "KHR", { locale: "km" })).toBe("40,000.00៛");
    expect(formatMoney(300000, "USD", { locale: "km", compact: true })).toBe("3K$");
  });

  it("names currencies in Khmer without relying on browser locale data", () => {
    expect(currencyName("KHR", "km")).toBe("រៀលកម្ពុជា");
    expect(currencyName("KHR", "en")).toBe("Cambodian Riel");
  });

  it("supports compact axis labels", () => {
    expect(formatMoney(450_000, "USD", { compact: true })).toBe("$4.5K");
  });
});
