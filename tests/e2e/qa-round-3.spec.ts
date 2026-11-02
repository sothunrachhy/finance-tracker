import { expect, test } from "@playwright/test";
import { registerNewUser } from "./helpers";

// Regression tests for the third QA report.

test("sign-up rejects a password made only of spaces", async ({ page }) => {
  await page.goto("/en/register");
  await page.getByLabel("Name").fill("Spacey");
  await page.getByLabel("Email").fill(`spaces-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("        ");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Password can't be only spaces")).toBeVisible();
  await expect(page).toHaveURL(/\/en\/register$/);
});

test.describe("password change", () => {
  let password: string;

  test.beforeEach(async ({ page }) => {
    ({ password } = await registerNewUser(page));
    await page.goto("/en/settings");
  });

  test("rejects spaces-only and unchanged passwords", async ({ page }) => {
    const current = page.getByLabel("Current password");
    const next = page.getByLabel("New password", { exact: true });
    const confirm = page.getByLabel("Confirm new password");
    const submit = page.getByRole("button", { name: "Change password" });

    await current.fill(password);
    await next.fill("         ");
    await confirm.fill("         ");
    await submit.click();
    await expect(page.getByText("Password can't be only spaces")).toBeVisible();

    await current.fill(password);
    await next.fill(password);
    await confirm.fill(password);
    await submit.click();
    await expect(page.getByText("Choose a password different from your current one")).toBeVisible();
    await expect(page.getByText("Password changed")).toHaveCount(0);
  });

  test("shows one message at a time, not a hint next to an error", async ({ page }) => {
    await expect(page.getByText("At least 8 characters", { exact: true })).toHaveCount(0);

    await page.getByLabel("Current password").fill(password);
    await page.getByLabel("New password", { exact: true }).fill("brand-new-password");
    await page.getByLabel("Confirm new password").fill("something-else");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(page.getByText("At least 8 characters", { exact: true })).toHaveCount(0);
  });
});

test("dialog and notification labels are translated on Khmer pages", async ({ page }) => {
  await registerNewUser(page);
  await page.goto("/km/transactions");
  await page.getByRole("button", { name: "បន្ថែមប្រតិបត្តិការ" }).first().click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "បិទ" })).toBeVisible();
  await expect(page.getByRole("region", { name: /^ការជូនដំណឹង/ })).toBeAttached();
});
