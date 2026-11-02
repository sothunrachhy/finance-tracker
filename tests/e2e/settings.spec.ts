import { expect, test } from "@playwright/test";
import { registerNewUser } from "./helpers";

test("profile, currency, password change and account deletion", async ({ page }) => {
  const { email, password } = await registerNewUser(page, "Grace Hopper");
  await page.goto("/settings");

  await page.getByLabel("Name").fill("Grace B. Hopper");
  await page.getByLabel("Currency").selectOption("EUR");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Hi, Grace" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Monthly totals" })).toContainText("€0.00");

  // Wrong current password, then a real change
  await page.goto("/settings");
  await page.getByLabel("Current password").fill("not-my-password");
  await page.getByLabel("New password", { exact: true }).fill("brand-new-password");
  await page.getByLabel("Confirm new password").fill("brand-new-password");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Current password is incorrect")).toBeVisible();

  await page.getByLabel("Current password").fill(password);
  await page.getByLabel("New password", { exact: true }).fill("brand-new-password");
  await page.getByLabel("Confirm new password").fill("brand-new-password");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password changed")).toBeVisible();

  // Delete the account; the credentials stop working
  await page.getByRole("button", { name: "Delete account" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByRole("button", { name: "Delete forever" })).toBeDisabled();
  await dialog.getByLabel("Type DELETE to confirm").fill("DELETE");
  await dialog.getByRole("button", { name: "Delete forever" }).click();
  await expect(page).toHaveURL("/en");

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("brand-new-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
});

test("CSV export escapes formulas and requires a session", async ({ page, request }) => {
  await registerNewUser(page);
  await page.goto("/transactions");
  await page.getByRole("button", { name: "Add transaction" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount").fill("42.5");
  await dialog.getByLabel("Category").selectOption({ label: "Shopping" });
  await dialog.getByLabel("Note").fill('=HYPERLINK("http://evil.example")');
  await dialog.getByRole("button", { name: "Add transaction" }).click();
  await expect(dialog).toBeHidden();

  const response = await page.request.get("/api/export");
  expect(response.headers()["content-type"]).toContain("text/csv");
  const csv = await response.text();
  expect(csv).toContain("Date,Type,Category,Amount,Note");
  expect(csv).toContain(`Expense,Shopping,-42.50,"'=HYPERLINK(""http://evil.example"")"`);

  // A request without the session cookie is rejected
  const anonymous = await request.get("/api/export");
  expect(anonymous.status()).toBe(401);
});

test("theme choice is remembered across reloads", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Change theme" }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Change theme" }).click();
  await page.getByRole("menuitemradio", { name: "Light" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("demo account can't change its password or be deleted", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/settings");
  await expect(page.getByText(/your own demo copy/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Change password" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Delete account" })).toBeDisabled();
});
