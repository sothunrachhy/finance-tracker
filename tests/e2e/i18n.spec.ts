import { expect, test } from "@playwright/test";
import { switchLanguage } from "./helpers";

test.describe("Khmer browser", () => {
  test.use({ locale: "km-KH" }); // sends Accept-Language: km-KH

  test("gets the Khmer site, and the flag menu switches to English and back", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/km");
    await expect(page.locator("html")).toHaveAttribute("lang", "km");
    await expect(
      page.getByRole("heading", { name: "ដឹងច្បាស់ថាលុយរបស់អ្នកចំណាយទៅណាខ្លះ" }),
    ).toBeVisible();

    // Only one flag is shown: the current language's
    await expect(page.getByRole("button", { name: "ភាសា: ខ្មែរ" })).toBeVisible();

    // Pick English from the menu; the choice is remembered on the next visit
    await switchLanguage(page, "English");
    await expect(page).toHaveURL("/en");
    await expect(
      page.getByRole("heading", { name: "Know exactly where your money goes" }),
    ).toBeVisible();
    await page.goto("/");
    await expect(page).toHaveURL("/en");

    // And back to Khmer, which is now the checked option
    await switchLanguage(page, "ខ្មែរ");
    await expect(page).toHaveURL("/km");
    await page.getByRole("button", { name: "ភាសា: ខ្មែរ" }).click();
    await expect(page.getByRole("menuitemradio", { name: "ខ្មែរ" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});

test("signing up in Khmer gives Khmer messages and categories", async ({ page }) => {
  await page.goto("/km/register");

  // Validation errors come back in Khmer
  await page.getByLabel("ឈ្មោះ").fill("សុខា");
  await page.getByLabel("អ៊ីមែល").fill("not-an-email");
  await page.getByLabel("ពាក្យសម្ងាត់").fill("short");
  await page.getByRole("button", { name: "បង្កើតគណនី" }).click();
  await expect(page.getByText("សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលត្រឹមត្រូវ")).toBeVisible();

  await page.getByLabel("អ៊ីមែល").fill(`km-${Date.now()}@example.com`);
  await page.getByLabel("ពាក្យសម្ងាត់").fill("correct-horse-42");
  await page.getByRole("button", { name: "បង្កើតគណនី" }).click();
  await expect(page).toHaveURL(/\/km\/dashboard$/);
  await expect(page.getByRole("heading", { name: "សួស្ដី សុខា" })).toBeVisible();

  // Starter categories were created in Khmer
  await page.goto("/km/categories");
  await expect(page.getByText("ប្រាក់ខែ")).toBeVisible();
  await expect(page.getByText("គ្រឿងទេស")).toBeVisible();
});

test("Khmer pages render the same in the browser as on the server", async ({ page }) => {
  // Browsers lack Khmer Intl data; a mismatch would show up as a hydration error
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/km");
  await page.getByRole("button", { name: "សាកល្បងគណនីគំរូ" }).click(); // "Try the demo"
  await expect(page).toHaveURL(/\/km\/dashboard$/);
  await page.goto("/km/dashboard?month=2026-10");
  // The month picker is a Client Component, so it's formatted again in the browser
  await expect(page.locator("main [aria-live=polite]")).toHaveText("តុលា 2026");
  await expect(page.getByRole("button", { name: "ខែមុន" })).toBeVisible();
  expect(errors.filter((e) => /hydrat|did not match/i.test(e))).toEqual([]);
});

test("switching language keeps the current page and filters", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try the demo/ }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  await page.goto("/en/transactions?month=all&type=income");
  await switchLanguage(page, "ខ្មែរ");
  await expect(page).toHaveURL(/\/km\/transactions\?month=all&type=income$/);
  await expect(page.getByRole("heading", { name: "ប្រតិបត្តិការ" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ផ្ទាំងគ្រប់គ្រង" })).toHaveAttribute(
    "href",
    "/km/dashboard",
  );
});
