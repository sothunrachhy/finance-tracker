import { expect, test } from "@playwright/test";
import { registerNewUser } from "./helpers";

// Regression tests for the second QA report.

test("each demo visitor gets a private copy", async ({ browser }) => {
  const startDemo = async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/en");
    await page.getByRole("button", { name: /Try the demo/ }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
    return { context, page };
  };

  const first = await startDemo();
  const second = await startDemo();

  // A change in one demo...
  await first.page.goto("/en/categories");
  await first.page.getByRole("button", { name: "Add" }).first().click();
  await first.page.getByRole("dialog").getByLabel("Name").fill("Only in my demo");
  await first.page.getByRole("dialog").getByRole("button", { name: "Add category" }).click();
  await expect(first.page.getByText("Only in my demo")).toBeVisible();

  // ...doesn't show up in another visitor's demo
  await second.page.goto("/en/categories");
  await expect(second.page.getByRole("heading", { name: "Categories" })).toBeVisible();
  await expect(second.page.getByText("Only in my demo")).toHaveCount(0);

  await first.context.close();
  await second.context.close();
});

test.describe("transaction form", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/en/transactions");
    await page.getByRole("button", { name: "Add transaction" }).first().click();
  });

  test("rejects dates far in the future", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Amount").fill("10");
    await dialog.getByLabel("Category").selectOption({ label: "Groceries" });
    await dialog.getByLabel("Date").fill("2099-12-31");
    await dialog.getByRole("button", { name: "Add transaction" }).click();
    await expect(dialog.getByText("Use a date no more than a year from today")).toBeVisible();
    await expect(dialog.getByLabel("Date")).toHaveAttribute("max", /^\d{4}-\d{2}-\d{2}$/);
  });

  test("says 'too large' for huge amounts", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Amount").fill("99999999999999");
    await dialog.getByRole("button", { name: "Add transaction" }).click();
    await expect(dialog.getByText("The largest amount allowed is 10,000,000.00")).toBeVisible();
  });

  test("the category's red border clears once a category is picked", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    const category = dialog.getByLabel("Category");
    await dialog.getByLabel("Amount").fill("10");
    await dialog.getByRole("button", { name: "Add transaction" }).click();
    await expect(category).toHaveAttribute("aria-invalid", "true");

    await category.selectOption({ label: "Groceries" });
    await expect(category).not.toHaveAttribute("aria-invalid");
  });

  test("an empty submit keeps the dialog open and opens no menu", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Add transaction" }).click();
    await expect(dialog.getByText("Choose a category").last()).toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
});

test("theme menu closes after choosing", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: "Change theme" }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("notes in the transactions list wrap instead of being cut off", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/en/transactions");
    await page.getByRole("button", { name: "Add transaction" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Amount").fill("8");
    await dialog.getByLabel("Category").selectOption({ label: "Dining Out" });
    await dialog.getByLabel("Note").fill("Lunch with the whole team");
    await dialog.getByRole("button", { name: "Add transaction" }).click();
    await expect(dialog).toBeHidden();

    const note = page.getByRole("cell").getByText("Lunch with the whole team");
    await expect(note).toBeVisible();
    // Not truncated: the element shows its full text
    expect(await note.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  });
});
