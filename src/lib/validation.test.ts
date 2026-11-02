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

  it("requires an 8+ character password", () => {
    const result = registerSchema.safeParse({ name: "A", email: "a@b.co", password: "short" });
    expect(result.success).toBe(false);
  });
});

describe("transactionSchema", () => {
  it("turns the amount into cents and empty notes into null", () => {
    const result = transactionSchema.parse({
      categoryId,
      amount: "12.50",
      date: "2026-11-02",
      note: "   ",
    });
    expect(result).toEqual({ categoryId, amount: 1250, date: "2026-11-02", note: null });
  });

  it.each(["0", "0.00", "-1", "abc", "100000000"])("rejects amount %j", (amount) => {
    const result = transactionSchema.safeParse({
      categoryId,
      amount,
      date: "2026-11-02",
      note: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects impossible dates", () => {
    const result = transactionSchema.safeParse({
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
    expect(budgetSchema.safeParse({ categoryId, month: "2026-11", amount: "100" }).success).toBe(
      true,
    );
    expect(budgetSchema.safeParse({ categoryId, month: "Nov", amount: "100" }).success).toBe(false);
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
});
