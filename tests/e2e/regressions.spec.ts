import { expect, type Page, test } from "@playwright/test";
import { registerNewUser, switchLanguage } from "./helpers";

// One test per issue from the QA report, so they can't quietly come back.

async function addExpense(page: Page, amount: string, category: string, note: string) {
  await page.getByRole("button", { name: "Add transaction" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount").fill(amount);
  await dialog.getByLabel("Category").selectOption({ label: category });
  await dialog.getByLabel("Note").fill(note);
  await dialog.getByRole("button", { name: "Add transaction" }).click();
  await expect(dialog).toBeHidden();
}

test("Add transaction keeps the chosen category after a validation error", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/en/transactions");
  await page.getByRole("button", { name: "Add transaction" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount").fill("abc");
  await dialog.getByLabel("Category").selectOption({ label: "Groceries" });
  await dialog.getByRole("button", { name: "Add transaction" }).click();

  await expect(dialog.getByText("Enter a number, like 3000 or 12.50")).toBeVisible();
  await expect(dialog.getByLabel("Category").locator("option:checked")).toHaveText("Groceries");
});

test("a field's error disappears as soon as it's edited", async ({ page }) => {
  await page.goto("/en/register");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();

  await page.getByLabel("Email").pressSequentially("x");
  await expect(page.getByText("Enter a valid email address")).toBeHidden();
});

test("switching language doesn't log a script-tag error", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/en");
  await switchLanguage(page, "ខ្មែរ");
  await expect(page).toHaveURL("/km");
  await switchLanguage(page, "English");
  await expect(page).toHaveURL("/en");
  expect(errors.filter((e) => /script tag/i.test(e))).toEqual([]);
});

test("CSV export follows the search and filters", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/en/transactions");
  await addExpense(page, "10", "Groceries", "Apples");
  await addExpense(page, "20", "Transport", "Bus");

  await page.getByLabel("Search transactions").fill("APPLE");
  await expect(page).toHaveURL(/q=APPLE/);
  const href = await page.getByRole("link", { name: "Export CSV" }).getAttribute("href");
  expect(href).toContain("q=APPLE");

  const csv = await (await page.request.get(href!)).text();
  expect(csv).toContain("Apples");
  expect(csv).not.toContain("Bus");
});

test("signed-in visitors skip the landing page", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/en");
  await expect(page).toHaveURL(/\/en\/dashboard$/);
});

test("starter categories follow the language until renamed", async ({ page }) => {
  await registerNewUser(page); // signed up in English
  await page.goto("/km/categories");
  await expect(page.getByText("ប្រាក់ខែ")).toBeVisible();
  await expect(page.getByText("Salary", { exact: true })).toHaveCount(0);

  // Renaming makes it a normal category with the user's own name in every language
  await page.getByRole("button", { name: "កែប្រែ គ្រឿងទេស" }).click();
  await page.getByRole("dialog").getByLabel("ឈ្មោះ").fill("Market");
  await page.getByRole("dialog").getByRole("button", { name: "រក្សាទុកការផ្លាស់ប្ដូរ" }).click();
  await expect(page.getByText("Market", { exact: true })).toBeVisible();
  await page.goto("/en/categories");
  await expect(page.getByText("Market", { exact: true })).toBeVisible();
  await expect(page.getByText("Salary", { exact: true })).toBeVisible();
});

test("delete confirmation names the transaction", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/en/transactions");
  await addExpense(page, "12.50", "Groceries", "Weekly shop");
  await page.getByRole("button", { name: "Delete Weekly shop" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText("Delete “Weekly shop”?");
  await expect(dialog).toContainText("$12.50 on");
});

test("an empty dashboard chart shows a message instead of a $0–$4 axis", async ({ page }) => {
  await registerNewUser(page);
  await expect(page.getByText("No income or expenses in the last 6 months yet.")).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the landing header fits and the menu panel is labelled", async ({ page }) => {
    await page.goto("/en");
    const header = page.locator("header").first();
    const box = await header.boundingBox();
    expect(box!.height).toBeLessThan(80); // one row, nothing wrapped
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();

    await registerNewUser(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  });
});
