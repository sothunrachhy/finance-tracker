import { expect, type Page, test } from "@playwright/test";
import { registerNewUser } from "./helpers";

// Regression tests for the fourth QA report (live-site test, November 2026).

async function addTransaction(page: Page, amount: string, category = "Groceries") {
  await page.getByRole("button", { name: "Add transaction" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount").fill(amount);
  await dialog.getByLabel("Category").selectOption({ label: category });
  await dialog.getByRole("button", { name: "Add transaction" }).click();
  return dialog;
}

test("pages send security headers, so the app can't be framed", async ({ request }) => {
  const headers = (await request.get("/en")).headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["strict-transport-security"]).toContain("max-age=");
});

test("unknown pages get the app's 404, and unknown languages a real page", async ({ page }) => {
  const response = await page.goto("/km/nonexistent-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "រកមិនឃើញទំព័រ" })).toBeVisible();

  await page.goto("/fr/login");
  await expect(page).toHaveURL(/\/(en|km)\/login$/);
});

test("robots.txt and sitemap.xml exist", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('hreflang="km"');
});

test("wrong months and pages in the URL are corrected, not silently swapped", async ({
  page,
  request,
}) => {
  await registerNewUser(page);

  await page.goto("/en/transactions?month=2026-13&type=income");
  await expect(page).toHaveURL(/\/en\/transactions\?type=income$/);

  await page.goto("/en/transactions?month=all&page=999");
  await expect(page).toHaveURL(/\/en\/transactions\?month=all$/);

  await page.goto("/en/dashboard?month=abc");
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  // The export says what's wrong instead of exporting another month
  const exported = await page.request.get("/api/export?month=2026-13");
  expect(exported.status()).toBe(400);
  expect((await request.get("/api/report?month=nope")).status()).toBe(401); // signed out
});

test("riel amounts are whole numbers with a higher limit", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/en/settings");
  await page.getByLabel("Currency").selectOption("KHR");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved")).toBeVisible();

  await page.goto("/en/transactions");
  let dialog = await addTransaction(page, "4200.50");
  await expect(dialog.getByText("Riel amounts can't have decimals")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();

  dialog = await addTransaction(page, "15,000,000");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("cell", { name: /KHR\s15,000,000$/ })).toBeVisible();
});

test("a negative amount gets a clear message", async ({ page }) => {
  await registerNewUser(page);
  const dialog = await addTransaction(page, "-5");
  await expect(dialog.getByText("Amount must be greater than 0")).toBeVisible();
});

test("category names are unique regardless of case", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/en/categories");
  await page.getByRole("button", { name: "Add" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name").fill("groceries");
  await dialog.getByRole("button", { name: "Add category" }).click();
  await expect(dialog.getByText("You already have a category with this name")).toBeVisible();
});

test("a budget spent to the cent is at its limit, not over", async ({ page }) => {
  await registerNewUser(page);
  await expect(await addTransaction(page, "35")).toBeHidden();

  await page.goto("/en/budgets");
  await page
    .getByRole("region", { name: "Spending without a budget" })
    .getByRole("button", { name: "Set budget" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Monthly limit").fill("35");
  await dialog.getByRole("button", { name: "Save budget" }).click();
  const card = page.getByRole("listitem").filter({ hasText: "Groceries" });
  await expect(card).toContainText("At limit");
  await expect(card).not.toContainText("Over budget");
});

test("a search from the header shows up in the page's search box", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/en/transactions");
  await page.keyboard.press("Control+k");
  await page.keyboard.type("coffee");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/q=coffee/);
  await expect(page.getByLabel("Search transactions")).toHaveValue("coffee");
});

test("a deleted transaction disappears as soon as the delete is confirmed", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/en/transactions");
  await expect(await addTransaction(page, "12")).toBeHidden();

  const row = page.getByRole("row").filter({ hasText: "Groceries" });
  await row.getByRole("button", { name: "Delete Groceries" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(row).toBeHidden({ timeout: 500 });
  await expect(page.getByText("Transaction deleted")).toBeVisible();
});

test("avatar initials skip symbols at the start of a name", async ({ page }) => {
  await registerNewUser(page, "<Sokha Chan");
  const menu = page.getByRole("button", { name: "Account menu" });
  await expect(menu.locator("span[aria-hidden]").first()).toHaveText("SC");
});
