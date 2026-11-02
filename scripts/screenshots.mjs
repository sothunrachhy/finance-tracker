// Captures README screenshots of the demo account: `node scripts/screenshots.mjs [outDir]`
// Set LOCALE=km for the Khmer version. Needs the app running
// (npm run build && npm run start -- -p 3100).
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const LOCALE = process.env.LOCALE ?? "en";
const OUT_DIR = process.argv[2] ?? "docs/screenshots";
const SUFFIX = LOCALE === "en" ? "" : `-${LOCALE}`;

// Last month has a full month of demo data, so it makes for better pictures
const now = new Date();
const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
const MONTH = `${last.getUTCFullYear()}-${String(last.getUTCMonth() + 1).padStart(2, "0")}`;
const PAGES = [
  ["dashboard", `/dashboard?month=${MONTH}`],
  ["transactions", `/transactions?month=${MONTH}`],
  ["categories", "/categories"],
  ["budgets", `/budgets?month=${MONTH}`],
  ["settings", "/settings"],
];

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
    await page.goto(`${BASE_URL}/${LOCALE}`);
    // The demo button is the landing page's only form
    await page.locator("main form button[type=submit]").click();
    await page.waitForURL(`**/${LOCALE}/dashboard`);

    for (const [name, path] of PAGES) {
      await page.goto(`${BASE_URL}/${LOCALE}${path}`);
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `${OUT_DIR}/${name}-${viewport.name}-${scheme}${SUFFIX}.png`,
        fullPage: viewport.name === "mobile",
      });
    }
    await context.close();
  }
}

await browser.close();
console.log(`Screenshots saved to ${OUT_DIR}`);
