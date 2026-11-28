import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests (task 0007). Runs against the production build served by
 * `vite preview`, with the same base path as the build (BASE_PATH, default "/"),
 * so the deploy build (/astronomy/) is tested exactly as it is published.
 */
const base = process.env["BASE_PATH"] ?? "/";
const port = 4173;
const isCI = Boolean(process.env["CI"]);

/**
 * Optional Chromium binary, for machines with a pre-installed browser that
 * does not match this Playwright version. CI installs the matching browser
 * with `npx playwright install chromium` and leaves this unset.
 */
const executablePath = process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"];
const launchOptions = executablePath ? { executablePath } : {};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}${base}`,
    // Deterministic dates and times (see CLAUDE.md "Testing").
    timezoneId: "Europe/Berlin",
    locale: "de-DE",
    trace: "off",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, launchOptions },
    },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
  webServer: {
    // CI tests the dist/ built (and uploaded) by the previous step; locally
    // build first so the tests never run against a stale dist/.
    command: `${isCI ? "" : "npx vite build && "}npx vite preview --port ${port} --strictPort`,
    url: `http://localhost:${port}${base}`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
