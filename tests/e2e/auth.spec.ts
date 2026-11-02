import { expect, test } from "@playwright/test";
import { registerNewUser } from "./helpers";

test("signed-out visitors are sent to login, then back where they were going", async ({ page }) => {
  await page.goto("/budgets");
  await expect(page).toHaveURL(/\/en\/login\?next=%2Fen%2Fbudgets$/);

  const { email, password } = await (async () => {
    const context = await page.context().browser()!.newContext();
    const other = await context.newPage();
    const creds = await registerNewUser(other);
    await context.close();
    return creds;
  })();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/en\/budgets$/);
});

test("register, log out, and log back in", async ({ page }) => {
  const { email, password } = await registerNewUser(page, "Ada Lovelace");
  await expect(page.getByRole("heading", { name: "Hi, Ada" })).toBeVisible();

  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL("/en");

  // Logged out: protected pages redirect again
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue(email);

  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("register shows validation errors and rejects duplicate emails", async ({ page }) => {
  const { email } = await registerNewUser(page);
  await page.context().clearCookies();

  await page.goto("/register");
  await page.getByLabel("Name").fill("Someone");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveValue("Someone");

  await page.getByLabel("Email").fill(email.toUpperCase()); // emails are case-insensitive
  await page.getByLabel("Password").fill("long-enough-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("An account with this email already exists")).toBeVisible();
});

test("demo button logs into the sample account", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Hi, Demo" })).toBeVisible();
});
