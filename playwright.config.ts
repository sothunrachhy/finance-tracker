import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// End-to-end tests run against a production build (`npm run build` first) and
// the local database from docker-compose.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 2 : 0,
  // Password hashing is deliberately slow, so give form submissions some headroom
  expect: { timeout: 15_000 },
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Run Next with the exact Node binary running Playwright (not via npm or a `node`
    // launcher shim), so stopping this process really stops the server on Windows
    command: `"${process.execPath}" node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
