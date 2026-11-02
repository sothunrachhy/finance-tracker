import { expect, test } from "@playwright/test";
import { registerNewUser } from "./helpers";

test("set, edit, copy and remove budgets", async ({ page }) => {
  await registerNewUser(page);

  // Spend $90 on groceries this month
  await page.getByRole("button", { name: "Add transaction" }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount").fill("90");
  await dialog.getByLabel("Category").selectOption({ label: "Groceries" });
  await dialog.getByRole("button", { name: "Add transaction" }).click();
  await expect(dialog).toBeHidden();

  await page.goto("/budgets");
  await expect(page.getByText(/^No budgets for/)).toBeVisible();
  const unbudgeted = page.getByRole("region", { name: "Spending without a budget" });
  await expect(unbudgeted).toContainText("Groceries");

  // $90 of $100 = 90% -> warning
  await unbudgeted.getByRole("button", { name: "Set budget" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Monthly limit").fill("100");
  await dialog.getByRole("button", { name: "Save budget" }).click();
  await expect(dialog).toBeHidden();
  const card = page.getByRole("listitem").filter({ hasText: "Groceries" });
  await expect(card).toContainText("Near limit");
  await expect(card).toContainText("$10.00 left");
  await expect(card.getByRole("meter", { name: "Groceries budget" })).toHaveAttribute(
    "aria-valuetext",
    "90% of budget used",
  );
  await expect(unbudgeted).toBeHidden();

  // Lower the limit to $50 -> over budget
  await card.getByRole("button", { name: "Edit Groceries budget" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Monthly limit").fill("50");
  await dialog.getByRole("button", { name: "Save budget" }).click();
  await expect(card).toContainText("Over budget");
  await expect(card).toContainText("$40.00 over");

  // Next month starts empty and can copy this month's budgets
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByText(/^No budgets for/)).toBeVisible();
  await page.getByRole("button", { name: /^Copy .* budgets$/ }).click();
  await expect(page.getByText("Copied 1 budget")).toBeVisible();
  await expect(card).toContainText("On track");
  await expect(card).toContainText("$0.00 of $50.00");

  // Remove it again
  await card.getByRole("button", { name: "Delete Groceries budget" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(/^No budgets for/)).toBeVisible();
});
