import { describe, expect, it } from "vitest";
import {
  budgetSchema,
  changePasswordSchema,
  registerSchema,
  transactionSchema,
} from "./validation";

const categoryId = "0b8c6f1e-3d7a-4c1b-9a2e-5f6d7e8c9b0a";

describe("registerSchema", () => {
  it("normalizes email to lowercase", () => {
    const result = registerSchema.parse({
      name: " Ada ",
      email: "  Ada@Example.COM ",
      password: "long-enough",
    });
    expect(result).toEqual({ name: "Ada", email: "ada@example.com", password: "long-enough" });
  });

  it("rejects a password made only of whitespace, but keeps meaningful spaces", () => {
    const base = { name: "A", email: "a@b.co" };
    expect(registerSchema.safeParse({ ...base, password: "        " }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: " \t \n    " }).success).toBe(false);
    expect(registerSchema.parse({ ...base, password: " pass phrase " }).password).toBe(
      " pass phrase ",
    );
  });

  it("requires an 8+ character password", () => {
    const result = registerSchema.safeParse({ name: "A", email: "a@b.co", password: "short" });
    expect(result.success).toBe(false);
  });
});

describe("transactionSchema", () => {
  it("turns the amount into cents and empty notes into null", () => {
    const result = transactionSchema("USD").parse({
      categoryId,
      amount: "12.50",
      date: "2026-11-02",
      note: "   ",
    });
    expect(result).toEqual({ categoryId, amount: 1250, date: "2026-11-02", note: null });
  });

  it.each(["0", "0.00", "-1", "abc", "100000000"])("rejects amount %j", (amount) => {
    const result = transactionSchema("USD").safeParse({
      categoryId,
      amount,
      date: "2026-11-02",
      note: "",
    });
    expect(result.success).toBe(false);
  });

  it("explains a negative amount instead of calling it not a number", () => {
    const result = transactionSchema("USD").safeParse({
      categoryId,
      amount: "-5",
      date: "2026-11-02",
      note: "",
    });
    expect(result.error?.issues[0].message).toBe("validation.amountPositive");
  });

  it("takes riel in whole numbers, up to 1,000,000,000", () => {
    const parse = (amount: string) =>
      transactionSchema("KHR").safeParse({ categoryId, amount, date: "2026-11-02", note: "" });
    expect(parse("15,000,000").data?.amount).toBe(1_500_000_000);
    expect(parse("1000000000").success).toBe(true);
    expect(parse("1000000001").error?.issues[0].message).toBe("validation.amountTooLargeRiel");
    expect(parse("4200.50").error?.issues[0].message).toBe("validation.amountWhole");
    // Other currencies keep the 10,000,000.00 limit
    expect(
      transactionSchema("USD").safeParse({
        categoryId,
        amount: "15000000",
        date: "2026-11-02",
        note: "",
      }).error?.issues[0].message,
    ).toBe("validation.amountTooLarge");
  });

  it("rejects impossible dates", () => {
    const result = transactionSchema("USD").safeParse({
      categoryId,
      amount: "5",
      date: "2026-02-30",
      note: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("budgetSchema", () => {
  it("validates the month format", () => {
    expect(
      budgetSchema("USD").safeParse({ categoryId, month: "2026-11", amount: "100" }).success,
    ).toBe(true);
    expect(budgetSchema("USD").safeParse({ categoryId, month: "Nov", amount: "100" }).success).toBe(
      false,
    );
  });
});

describe("changePasswordSchema", () => {
  it("requires the confirmation to match", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["confirmPassword"]);
  });

  it("requires the new password to differ from the current one", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "same-password",
      newPassword: "same-password",
      confirmPassword: "same-password",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: ["newPassword"],
      message: "validation.passwordUnchanged",
    });
  });
});
