import { expect, type Page } from "@playwright/test";

/** Opens the flag menu in the header and picks a language ("English" or "ខ្មែរ"). */
export async function switchLanguage(page: Page, language: "English" | "ខ្មែរ") {
  await page.getByRole("button", { name: /^(Language|ភាសា):/ }).click();
  await page.getByRole("menuitemradio", { name: language }).click();
}

/** Registers a brand-new user (unique email per call) and lands on the dashboard. */
export async function registerNewUser(page: Page, name = "Test User") {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = "correct-horse-42";

  await page.goto("/register");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  return { email, password };
}
