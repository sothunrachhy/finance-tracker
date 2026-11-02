// Captures README screenshots of the demo account: `node scripts/screenshots.mjs`
// Needs the app running (npm run build && npm run start -- -p 3100).
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const OUT_DIR = process.argv[2] ?? "docs/screenshots";
const PAGES = ["dashboard", "transactions", "categories", "budgets", "settings"];

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();

for (const scheme of ["light", "dark"]) {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
      viewport,
      colorScheme: scheme,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/`);
    await page.getByRole("button", { name: /Try the demo/ }).click();
    await page.waitForURL("**/dashboard");

    for (const name of PAGES) {
      await page.goto(`${BASE_URL}/${name}`);
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `${OUT_DIR}/${name}-${viewport.name}-${scheme}.png`,
        fullPage: viewport.name === "mobile",
      });
    }
    await context.close();
  }
}

await browser.close();
console.log(`Screenshots saved to ${OUT_DIR}`);
