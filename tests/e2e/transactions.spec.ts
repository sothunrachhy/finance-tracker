import { expect, type Page, test } from "@playwright/test";
import { registerNewUser } from "./helpers";

async function addTransaction(
  page: Page,
  {
    type,
    amount,
    category,
    note,
  }: { type: "Expense" | "Income"; amount: string; category: string; note: string },
) {
  await page.getByRole("button", { name: "Add transaction" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: type, exact: true }).click();
  await dialog.getByLabel("Amount").fill(amount);
  await dialog.getByLabel("Category").selectOption({ label: category });
  await dialog.getByLabel("Note").fill(note);
  await dialog.getByRole("button", { name: "Add transaction" }).click();
  await expect(dialog).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/transactions");
});

test("add, edit and delete a transaction", async ({ page }) => {
  await expect(page.getByText("No transactions yet")).toBeVisible();

  await addTransaction(page, {
    type: "Expense",
    amount: "12.50",
    category: "Groceries",
    note: "Weekly shop",
  });
  const row = page.getByRole("row", { name: /Weekly shop/ });
  await expect(row).toContainText("-$12.50");
  await expect(page.getByText("1 transaction · Income $0.00 · Expenses $12.50")).toBeVisible();

  await row.getByRole("button", { name: "Edit Weekly shop" }).click();
  await page.getByRole("dialog").getByLabel("Amount").fill("20");
  await page.getByRole("dialog").getByRole("button", { name: "Save changes" }).click();
  await expect(row).toContainText("-$20.00");

  await row.getByRole("button", { name: "Delete Weekly shop" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("No transactions yet")).toBeVisible();
});

test("shows validation errors", async ({ page }) => {
  await page.getByRole("button", { name: "Add transaction" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount").fill("12.345");
  await dialog.getByRole("button", { name: "Add transaction" }).click();
  await expect(dialog.getByText("Enter an amount like 12.50")).toBeVisible();
  await expect(dialog.getByText("Choose a category")).toHaveCount(2); // placeholder + error
  await expect(dialog.getByLabel("Amount")).toHaveValue("12.345");
});

test("filters by type and searches notes", async ({ page }) => {
  await addTransaction(page, {
    type: "Income",
    amount: "1000",
    category: "Salary",
    note: "Paycheck",
  });
  await addTransaction(page, {
    type: "Expense",
    amount: "8",
    category: "Dining Out",
    note: "Coffee",
  });
  await expect(page.getByRole("row")).toHaveCount(3); // header + 2

  await page.getByLabel("Filter by type").selectOption("INCOME");
  await expect(page).toHaveURL(/type=income/);
  await expect(page.getByRole("row", { name: /Paycheck/ })).toContainText("+$1,000.00");
  await expect(page.getByRole("row", { name: /Coffee/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Search transactions").fill("coff");
  await expect(page).toHaveURL(/q=coff/);
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByRole("row", { name: /Coffee/ })).toBeVisible();
});

test("manage categories", async ({ page }) => {
  await addTransaction(page, { type: "Expense", amount: "5", category: "Transport", note: "Bus" });
  await page.goto("/categories");

  // Create a new category
  await page.getByRole("button", { name: "Add" }).first().click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name").fill("Pets");
  await dialog.getByLabel("Paw print").check({ force: true });
  await dialog.getByRole("button", { name: "Add category" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Pets")).toBeVisible();

  // Duplicate names are rejected
  await page.getByRole("button", { name: "Add" }).first().click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name").fill("Pets");
  await dialog.getByRole("button", { name: "Add category" }).click();
  await expect(dialog.getByText("You already have a category with this name")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();

  // A category that has transactions can't be deleted
  await page.getByRole("button", { name: "Delete Transport" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(/still has transactions/).last()).toBeVisible();
  await page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }).click();

  // An unused one can
  await page.getByRole("button", { name: "Delete Pets" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Pets", { exact: true })).toHaveCount(0);
});
