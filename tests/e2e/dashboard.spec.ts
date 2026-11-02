import { expect, test } from "@playwright/test";
import { registerNewUser } from "./helpers";

test("dashboard totals update as transactions are added", async ({ page }) => {
  await registerNewUser(page);
  await expect(page.getByText("No expenses recorded this month.")).toBeVisible();
  await expect(page.getByText("No income recorded yet")).toBeVisible();

  for (const t of [
    { type: "Income", amount: "1000", category: "Salary" },
    { type: "Expense", amount: "250", category: "Groceries" },
  ]) {
    await page.getByRole("button", { name: "Add transaction" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: t.type, exact: true }).click();
    await dialog.getByLabel("Amount").fill(t.amount);
    await dialog.getByLabel("Category").selectOption({ label: t.category });
    await dialog.getByRole("button", { name: "Add transaction" }).click();
    await expect(dialog).toBeHidden();
  }

  const totals = page.getByRole("region", { name: "Monthly totals" });
  await expect(totals).toContainText("Income$1,000.00");
  await expect(totals).toContainText("Expenses$250.00");
  await expect(totals).toContainText("Net+$750.00");
  await expect(totals).toContainText("Savings rate75%");

  await expect(page.getByText("$250.00 total")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Groceries" }).first()).toContainText(
    "100%",
  );
});

test("demo dashboard shows charts and budget warnings", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/ }).click();

  // Previous month always has a complete month of demo data
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(page).toHaveURL(/month=\d{4}-\d{2}/);
  await expect(page.getByRole("table", { name: "Income and expenses by month" })).toBeAttached();
  await expect(page.getByRole("listitem").filter({ hasText: "Housing" }).first()).toBeVisible();
  await expect(page.getByText(/Over budget|Near limit/).first()).toBeVisible();
});
