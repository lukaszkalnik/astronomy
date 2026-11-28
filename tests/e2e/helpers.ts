import { expect, type Page } from "@playwright/test";

/**
 * Collect console errors, uncaught exceptions, failed requests and HTTP errors
 * of a page. Call before `goto`; assert with `expectNoProblems`.
 */
export function trackProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) =>
    problems.push(`requestfailed: ${req.url()} (${req.failure()?.errorText ?? "?"})`),
  );
  page.on("response", (res) => {
    if (res.status() >= 400) problems.push(`HTTP ${res.status()}: ${res.url()}`);
  });
  return problems;
}

export function expectNoProblems(problems: readonly string[]): void {
  expect(problems, problems.join("\n")).toEqual([]);
}

/** Every SVG matched by `selector` has drawn child elements. */
export async function expectSvgsDrawn(page: Page, selectors: readonly string[]): Promise<void> {
  for (const sel of selectors) {
    await expect
      .poll(() => page.locator(`${sel} *`).count(), { message: `${sel} is empty` })
      .toBeGreaterThan(0);
  }
}

/** The canvas has a size and differs from a blank canvas of that size. */
export async function isCanvasDrawn(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).evaluate((node) => {
    if (!(node instanceof HTMLCanvasElement) || node.width === 0 || node.height === 0) {
      return false;
    }
    const blank = document.createElement("canvas");
    blank.width = node.width;
    blank.height = node.height;
    return node.toDataURL() !== blank.toDataURL();
  });
}

export function canvasData(page: Page, selector: string): Promise<string> {
  return page.locator(selector).evaluate((node) => {
    if (!(node instanceof HTMLCanvasElement)) throw new Error("not a canvas");
    return node.toDataURL();
  });
}

/** At 360 px width the page does not scroll horizontally. */
export async function expectNoHorizontalScrollAt360(page: Page): Promise<void> {
  await page.setViewportSize({ width: 360, height: 800 });
  // Let ResizeObservers and resize handlers redraw at the new width.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}
